export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  props: string[];
  tags: Tag[];
  status: "OPEN" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
}
