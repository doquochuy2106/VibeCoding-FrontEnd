import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Trash2Icon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PopConfirm } from "@/components/ui/pop-confirm";
import {
  DataTableColumnHeader,
  type DataTableFeatures,
} from "@/components/data-table";
import { ImageModal } from "@/components/ui/image-modal";
import { EditUserDialog } from "./edit-user-dialog";
import { getAssetUrl } from "@/lib/utils";

export interface User {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  avatar?: string | null;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
  updatedAt: string;
}

export const roleLabel: Record<User["role"], string> = {
  ADMIN: "Admin",
  CUSTOMER: "Khách hàng",
};

const roleVariant: Record<User["role"], "default" | "secondary"> = {
  ADMIN: "default",
  CUSTOMER: "secondary",
};

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(-2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function UserAvatarCell({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center gap-2">
        <Avatar
          className={`h-8 w-8 ${
            user.avatar ? "cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all" : ""
          }`}
          onClick={(e) => {
            if (user.avatar) {
              e.stopPropagation();
              setOpen(true);
            }
          }}
          title={user.avatar ? "Nhấn để xem avatar" : undefined}
        >
          {user.avatar && (
            <AvatarImage
              src={getAssetUrl(user.avatar)}
              alt={user.name ?? ""}
            />
          )}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">
          {user.name ?? "(Chưa đặt tên)"}
        </span>
      </div>

      {user.avatar && (
        <ImageModal
          open={open}
          onClose={() => setOpen(false)}
          src={user.avatar}
          title={`Ảnh đại diện: ${user.name ?? `#${user.id}`}`}
        />
      )}
    </>
  );
}

const columnHelper = createColumnHelper<DataTableFeatures, User>();

function DeleteUserButton({
  user,
  onDelete,
}: {
  user: User;
  onDelete: (id: number) => Promise<void>;
}) {
  return (
    <PopConfirm
      title="Xóa người dùng?"
      description={`Bạn có chắc muốn xóa "${user.name ?? user.email}"? Hành động này không thể hoàn tác.`}
      confirmText="Xóa"
      onConfirm={() => onDelete(user.id)}
    >
      <Button variant="ghost" size="icon" aria-label="Xóa người dùng">
        <Trash2Icon className="text-destructive" />
      </Button>
    </PopConfirm>
  );
}

interface UserColumnActions {
  onDelete: (id: number) => Promise<void>;
  onEditSuccess: () => void;
}

export function createUserColumns({
  onDelete,
  onEditSuccess,
}: UserColumnActions) {
  return columnHelper.columns([
    columnHelper.accessor("id", {
      id: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      sortFn: "text",
      filterFn: "includesString",
      meta: { label: "Id" },
      cell: ({ row }) => {
        const user = row.original;
        return <div>{user.id}</div>;
      },
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Người dùng" />
      ),
      sortFn: "text",
      meta: { label: "Người dùng" },
      cell: ({ row }) => <UserAvatarCell user={row.original} />,
    }),
    columnHelper.accessor("email", {
      id: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      sortFn: "text",
      meta: { label: "Email" },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.email}</span>
      ),
    }),
    // columnHelper.accessor("phone", {
    //   id: "phone",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Số điện thoại" />
    //   ),
    //   sortFn: "alphanumeric",
    //   meta: { label: "Số điện thoại" },
    //   cell: ({ getValue }) => getValue() ?? "-",
    // }),
    columnHelper.accessor("role", {
      id: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vai trò" />
      ),
      sortFn: "alphanumeric",
      filterFn: "equalsString",
      meta: { label: "Vai trò" },
      cell: ({ getValue }) => {
        const role = getValue();
        return <Badge variant={roleVariant[role]}>{roleLabel[role]}</Badge>;
      },
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày tạo" />
      ),
      sortFn: "datetime",
      meta: { label: "Ngày tạo" },
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString("vi-VN"),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      meta: { label: "Thao tác" },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <EditUserDialog user={row.original} onSuccess={onEditSuccess} />
          <DeleteUserButton user={row.original} onDelete={onDelete} />
        </div>
      ),
    }),
  ]);
}
