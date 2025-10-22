import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnOrderState,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  GripVertical,
  Search,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import applicantAvatar from "../../assets/applicantAvatar.png";
import { useJobStore } from "../../store/jobStore";
import { Loading } from "../../components";
import emptyCandidates from "../../assets/emptyCandidates.png";

import type { CandidateRow, ApplicantRow } from "./types";

const DynamicCandidateTable: React.FC = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const { fetchManageJob, applicants, selectedJob, loading, error } = useJobStore();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
    "photo_profile",
    "fullName",
    "email",
    "phone",
    "domicile",
    "gender",
    "linkedin_link",
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

  useEffect(() => {
    if (job_id) fetchManageJob(job_id);
  }, [job_id, fetchManageJob]);

  const mappedApplicants: CandidateRow[] = useMemo(() => {
    if (!applicants || !Array.isArray(applicants)) return [];
    return (applicants as ApplicantRow[]).map((cand) => {
      const candidate: CandidateRow = { id: cand.id, job_id: cand.job_id };
      cand.attributes.forEach((attr) => {
        candidate[attr.key] = attr.value;
      });
      return candidate;
    });
  }, [applicants]);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center text-black w-full h-[70vh]">
      <img src={emptyCandidates} alt="empty" className="w-64 h-64 mb-4 object-contain" />
      <p className="text-base font-bold mb-1">No candidates found</p>
      <p className="text-sm text-gray-500 max-w-md">
        Share your job vacancies so that more candidates will apply.
      </p>
    </div>
  );

  const columns = useMemo<ColumnDef<CandidateRow>[]>(
    () => [
      {
        accessorKey: "photo_profile",
        header: "PHOTO",
        size: 70,
        cell: ({ getValue }) => {
          const value = getValue<string>();
          return (
            <img
              src={value || "https://via.placeholder.com/40x40?text=👤"}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/40x40?text=👤";
              }}
            />
          );
        },
      },
      {
        accessorKey: "fullName",
        header: "FULL NAME",
        size: 180,
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-800">{getValue<string>()}</span>
        ),
      },
      { accessorKey: "email", header: "EMAIL", size: 200 },
      { accessorKey: "phone", header: "PHONE", size: 140 },
      { accessorKey: "domicile", header: "DOMICILE", size: 200 },
      { accessorKey: "gender", header: "GENDER", size: 100 },
      {
        accessorKey: "linkedin_link",
        header: "LINKEDIN",
        size: 200,
        cell: ({ getValue }) => {
          const link = getValue<string>();
          return link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate block max-w-[180px]"
            >
              {link}
            </a>
          ) : (
            "-"
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: mappedApplicants,
    columns,
    state: { sorting, columnOrder, globalFilter, columnSizing },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onGlobalFilterChange: setGlobalFilter,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
  });

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumnId) return;
    const newOrder = [...columnOrder];
    const draggedIdx = newOrder.indexOf(draggedColumn);
    const targetIdx = newOrder.indexOf(targetColumnId);
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedColumn);
    setColumnOrder(newOrder);
    setDraggedColumn(null);
  };

  if (loading) return <Loading text="Loading candidates..." />;

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-600">
        <p className="text-lg font-semibold">Something went wrong.</p>
        <button
          onClick={() => fetchManageJob(job_id!)}
          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Refresh
        </button>
      </div>
    );

  const TopBar = () => (
    <div className="w-screen fixed top-0 left-0 z-50 bg-white border-b border-[#E0E0E0]">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={() => navigate("/admin", { replace: true })}
            className="
                cursor-pointer
                px-4 py-1.5
                bg-white
                rounded-lg
                text-sm
                font-bold
                text-black
                border border-[#E0E0E0]
                shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]
                transition-all
              "
          >
            Job List
          </button>

          <ChevronRight className="w-4 h-4 text-gray-400" />

          <span
            className="
                px-3 py-1
                bg-[#EDEDED]
                border border-[#C2C2C2]
                text-black
                rounded-lg
                font-bold
                cursor-default
              "
          >
            Manage Candidate
          </span>
        </div>

        <div className="flex items-center">
          <img
            src={applicantAvatar}
            alt="Admin"
            className="w-7 h-7 rounded-full border"
          />
        </div>
      </div>
    </div>
  );
    

  const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="pt-16 px-6">{children}</div>
  );

  if (!mappedApplicants || mappedApplicants.length < 1) {
    return (
      <div className="w-full bg-white min-h-screen rounded-lg">
        <TopBar />
        <PageContainer>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedJob?.title || "Job Title"}
          </h2>
          <EmptyState />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen rounded-lg">
      <TopBar />
      <PageContainer>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-4">
          {selectedJob?.title || "Job Title"}
        </h2>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search candidates..."
            className="
              w-full pl-10 pr-4 py-2
              border border-gray-300
              rounded-lg
              focus:ring-2 focus:ring-purple-500
              focus:outline-none
            "
          />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ tableLayout: "fixed" }}>
              <thead className="bg-gray-50 border-b border-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, header.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, header.id)}
                        style={{ width: header.getSize(), position: "relative" }}
                        className="
                          px-4 py-3
                          text-left text-xs
                          font-semibold text-gray-600
                          uppercase tracking-wider
                          cursor-move
                        "
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <div
                            className="flex items-center gap-2 flex-1"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <span className="cursor-pointer">
                                {header.column.getIsSorted() === "asc" ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm text-gray-700 truncate"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default DynamicCandidateTable;
