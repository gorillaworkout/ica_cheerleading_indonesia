import React from "react";
import { useAppSelector } from "@/lib/redux/hooks";

export function NewsTable() {
  const news = useAppSelector((state) => state.news.newsList);  // Get news from Redux
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Title
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Category
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {news.map((newsItem) => (
            <tr key={newsItem.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {newsItem.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(newsItem.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {newsItem.category}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
