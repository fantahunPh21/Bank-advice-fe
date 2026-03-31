import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { API_BASE_URL } from "./config";

const BASE_URL = `${API_BASE_URL}/users`;

export function useUserRecords() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async (page, size, keyword = "") => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}?keyword=${keyword}&pageNumber=${page - 1}&pageSize=${size}`
      );
      if (!response.ok) throw new Error("Failed to fetch user records");
      const result = await response.json();
      setUsers(result.content || []);
      setTotalItems(result.totalElements || result.pageable?.totalElements || 0);
    } catch (err) {
      message.error("Failed to load user records");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUser = async (data) => {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      message.success("User created successfully");
      fetchData(currentPage, pageSize, searchQuery);
    } catch (err) {
      message.error("Failed to create user");
    }
  };

  const updateUser = async (data) => {
    try {
      const response = await fetch(BASE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      message.success("User updated successfully");
      fetchData(currentPage, pageSize, searchQuery);
    } catch (err) {
      message.error("Failed to update user");
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      message.success("User deleted");
      fetchData(currentPage, pageSize, searchQuery);
    } catch (err) {
      message.error("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchData(currentPage, pageSize, searchQuery);
  }, [currentPage, pageSize, searchQuery, fetchData]);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return {
    users,
    isLoading,
    totalItems,
    currentPage,
    pageSize,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    handleTableChange,
    refresh: () => fetchData(currentPage, pageSize, searchQuery),
    addUser,
    updateUser,
    deleteUser
  };
}
