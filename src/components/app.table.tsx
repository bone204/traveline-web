"use client";

import type { ReactNode } from "react";

export type TableColumn<T extends Record<string, unknown>> = {
	key: keyof T | string;
	title: string;
	render?: (row: T) => ReactNode;
	width?: string | number;
};

export type AppTableProps<T extends Record<string, unknown>> = {
	columns: TableColumn<T>[];
	data: T[];
};

export default function AppTable<T extends Record<string, unknown>>({ columns, data }: AppTableProps<T>) {
	return (
		<div style={{ overflowX: "auto" }}>
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						{columns.map((col) => (
							<th
								key={String(col.key)}
								style={{
									textAlign: "left",
									padding: "8px",
									borderBottom: "1px solid #e5e7eb",
									width: col.width,
									whiteSpace: "nowrap",
								}}
							>
								{col.title}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map((row, idx) => (
						<tr key={idx}>
							{columns.map((col) => {
								const value = (row as Record<string, unknown>)[String(col.key)];
								return (
									<td
										key={String(col.key)}
										style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}
									>
										{col.render
											? col.render(row)
											: typeof value === "string" || typeof value === "number"
												? String(value)
												: "—"}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
