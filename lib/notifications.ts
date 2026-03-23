import { prisma } from "@/lib/prisma";

const EMAIL_FROM = process.env.EMAIL_FROM || "KinkList <onboarding@resend.dev>";

/**
 * In-memory buffer for batching item-add notifications.
 * Key: listId, Value: array of { itemTitle, addedByUserId, addedAt }
 */
interface PendingNotification {
  itemTitle: string;
  addedByUserId: string;
  addedAt: Date;
}

const pendingNotifications = new Map<string, PendingNotification[]>();
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

const BATCH_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Queue a notification for a new item added to a list.
 * Notifications are batched per list — if multiple items are added within
 * the batch window, a single summary email is sent.
 */
export function queueItemNotification(
  listId: string,
  listHash: string,
  itemTitle: string,
  addedByUserId: string
): void {
  const pending = pendingNotifications.get(listId) ?? [];
  pending.push({ itemTitle, addedByUserId, addedAt: new Date() });
  pendingNotifications.set(listId, pending);

  // Reset the timer — send after BATCH_WINDOW_MS of quiet
  const existingTimer = pendingTimers.get(listId);
  if (existingTimer) clearTimeout(existingTimer);

  pendingTimers.set(
    listId,
    setTimeout(() => {
      void flushNotifications(listId, listHash);
    }, BATCH_WINDOW_MS)
  );
}

async function flushNotifications(
  listId: string,
  listHash: string
): Promise<void> {
  const items = pendingNotifications.get(listId);
  pendingNotifications.delete(listId);
  pendingTimers.delete(listId);

  if (!items || items.length === 0) return;

  try {
    // Get list details and all participants (owner + collaborators)
    const list = await prisma.todoList.findUnique({
      where: { id: listId },
      select: {
        title: true,
        ownerId: true,
        owner: { select: { email: true } },
        collaborators: {
          select: {
            userId: true,
            nickname: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!list || list.collaborators.length === 0) return;

    // Collect all unique adders in this batch
    const adderIds = new Set(items.map((i) => i.addedByUserId));

    // Build recipient list: owner + all collaborators, minus whoever added items
    const recipients: { email: string }[] = [];

    // Include owner if they didn't add all items
    if (!adderIds.has(list.ownerId) || adderIds.size > 1) {
      // Owner should be notified if someone else added items
      const otherAdded = items.some((i) => i.addedByUserId !== list.ownerId);
      if (otherAdded) {
        recipients.push({ email: list.owner.email });
      }
    }

    // Include collaborators who didn't add items
    for (const collab of list.collaborators) {
      const theyAdded = items.some(
        (i) => i.addedByUserId === collab.userId
      );
      if (!theyAdded) {
        recipients.push({ email: collab.user.email });
      }
    }

    if (recipients.length === 0) return;

    // Resolve adder display names
    const adderNames = new Map<string, string>();
    for (const adderId of adderIds) {
      if (adderId === list.ownerId) {
        adderNames.set(adderId, "the list owner");
      } else {
        const collab = list.collaborators.find(
          (c) => c.userId === adderId
        );
        adderNames.set(
          adderId,
          collab?.nickname || "a collaborator"
        );
      }
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const listUrl = `${appUrl}/list/${listHash}`;

    const itemSummary = items
      .map((i) => `- ${i.itemTitle} (added by ${adderNames.get(i.addedByUserId)})`)
      .join("\n");

    const subject =
      items.length === 1
        ? `New item in "${list.title}"`
        : `${items.length} new items in "${list.title}"`;

    const htmlItems = items
      .map(
        (i) =>
          `<li>${escapeHtml(i.itemTitle)} <em>(added by ${escapeHtml(adderNames.get(i.addedByUserId) || "someone")})</em></li>`
      )
      .join("");

    const html = `
      <h2>${escapeHtml(subject)}</h2>
      <ul>${htmlItems}</ul>
      <p><a href="${listUrl}">View list</a></p>
    `;

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      for (const recipient of recipients) {
        try {
          await resend.emails.send({
            from: EMAIL_FROM,
            to: recipient.email,
            subject,
            html,
          });
        } catch (err) {
          console.error(
            `[notifications] Failed to send to ${recipient.email}:`,
            err
          );
        }
      }
    } else {
      console.log(
        `\n[DEV] Notification for list "${list.title}":\n` +
          `  Recipients: ${recipients.map((r) => r.email).join(", ")}\n` +
          `  Subject: ${subject}\n` +
          `  Items:\n${itemSummary}\n` +
          `  Link: ${listUrl}\n`
      );
    }
  } catch (err) {
    console.error("[notifications] Failed to flush notifications:", err);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
