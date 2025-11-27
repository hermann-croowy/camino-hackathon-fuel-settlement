import React, { useState, useEffect, useRef } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';

const DataTable = ({
    data,
    columns,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    onRowClick,
    selectedRowId,
    pageSize = 5,
}) => {
    // Track pagination internally within the table
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize,
    });

    // Track previous filter state to detect filter changes
    const prevFiltersRef = useRef(columnFilters);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
    });

    // Only reset page when filters actually change (not on every render)
    useEffect(() => {
        const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(columnFilters);
        if (filtersChanged) {
            prevFiltersRef.current = columnFilters;
            // Reset to first page when filters change
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }
    }, [columnFilters]);

    // Ensure page index is valid after filtering
    useEffect(() => {
        const pageCount = table.getPageCount();
        if (pageCount > 0 && pagination.pageIndex >= pageCount) {
            setPagination(prev => ({ ...prev, pageIndex: pageCount - 1 }));
        }
    }, [table.getFilteredRowModel().rows.length, pagination.pageIndex]);

    return (
        <div className="w-full">
            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white/50 shadow-sm">
                <table className="w-full min-w-[500px]">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-gray-200 bg-white/70">
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={cn(
                                            "px-3 py-4 text-left text-sm font-semibold text-black whitespace-nowrap",
                                            "md:px-5 md:py-4",
                                            header.column.getCanSort() && "cursor-pointer select-none hover:bg-[#FCCC04]/10"
                                        )}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-2">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            {header.column.getCanSort() && (
                                                <SortIndicator direction={header.column.getIsSorted()} />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-12 text-center text-black/60"
                                >
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick?.(row.original)}
                                    className={cn(
                                        "border-b border-gray-100 transition-colors cursor-pointer",
                                        selectedRowId === row.original.orderId
                                            ? "bg-[#FCCC04]/20"
                                            : "hover:bg-[#FCCC04]/5"
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-3 py-4 text-sm text-black md:px-5"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {table.getPageCount() > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 bg-white/50 rounded-xl p-3 md:p-4 border border-gray-200 gap-3">
                    <p className="text-black/50 text-sm order-2 sm:order-1">
                        Showing {pagination.pageIndex * pageSize + 1}-
                        {Math.min(
                            (pagination.pageIndex + 1) * pageSize,
                            table.getFilteredRowModel().rows.length
                        )}{" "}
                        of {table.getFilteredRowModel().rows.length} orders
                    </p>
                    
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="text-black p-2 border border-[#4C4C4B]/30 hover:bg-[#4C4C4B]/10 rounded-lg bg-transparent disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: table.getPageCount() }, (_, i) => i).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => table.setPageIndex(page)}
                                    className={cn(
                                        "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                                        table.getState().pagination.pageIndex === page
                                            ? "bg-[#FCCC04] text-black"
                                            : "text-black/60 hover:bg-[#FCCC04]/20"
                                    )}
                                >
                                    {page + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="text-black p-2 border border-[#4C4C4B]/30 hover:bg-[#4C4C4B]/10 rounded-lg bg-transparent disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SortIndicator = ({ direction }) => {
    if (!direction) {
        return (
            <svg className="w-4 h-4 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
        );
    }

    return direction === 'asc' ? (
        <svg className="w-4 h-4 text-[#FCCC04]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
    ) : (
        <svg className="w-4 h-4 text-[#FCCC04]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
};

export { DataTable };
