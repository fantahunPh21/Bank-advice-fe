import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { useAuth } from "../auth/AuthProvider";
import { API_BASE_URL } from "./config";

const BASE_URL = `${API_BASE_URL}/branches`;

/**
 * Hook for managing shop/branch records.
 * Adapted from reference shopsRecord logic.
 */
export function useShops() {
  const { user, token } = useAuth();
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async (page, size, keyword = "") => {
    try {
      setIsLoading(true);
      setError(null);

      if (!token) throw new Error("Authentication token not found");

      // Build query parameters with user context
      const queryParams = new URLSearchParams({
        keyword: keyword,
        pageNumber: (page - 1).toString(), // API is 0-indexed
        pageSize: size.toString(),
      });

      // Add user context
      const userId = user?.uuid || user?.userId;
      if (userId) {
        queryParams.append("userId", userId.toString());
      }

      // Role-based logic
      const roles = Array.isArray(user?.role) ? user.role : (user?.role ? [user.role] : []);
      if (roles.includes("FINANCE")) {
        queryParams.append("userRole", "FINANCE");
        if (user?.companyId) {
          queryParams.append("companyId", user.companyId.toString());
        } else {
          queryParams.append("allCompanies", "true");
        }
      } else if (user?.companyId) {
        queryParams.append("companyId", user.companyId.toString());
      }

      const url = `${BASE_URL}?${queryParams}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('ce_token');
          localStorage.removeItem('ce_user');
          window.location.href = "/login";
          throw new Error("Session expired or access denied. Please log in again.");
        }
        const errorText = await response.text();
        
        // Retry logic for FINANCE users without companyId
        if (roles.includes("FINANCE") && !user?.companyId && errorText.includes("Company id not found")) {
          const retryParams = new URLSearchParams({
            keyword: keyword,
            pageNumber: (page - 1).toString(),
            pageSize: size.toString(),
            userRole: "FINANCE",
          });
          if (userId) retryParams.append("userId", userId.toString());
          
          const retryResponse = await fetch(`${BASE_URL}?${retryParams}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (retryResponse.ok) {
            const retryResult = await retryResponse.json();
            setShops(retryResult.content || retryResult || []);
            setTotalItems(retryResult.totalElements || retryResult.pageable?.totalElements || (Array.isArray(retryResult) ? retryResult.length : 0));
            return;
          }
        }

        throw new Error(errorText || `Error ${response.status}`);
      }

      const result = await response.json();
      setShops(result.content || (Array.isArray(result) ? result : []));
      setTotalItems(result.totalElements || result.pageable?.totalElements || (Array.isArray(result) ? result.length : 0));
    } catch (err) {
      console.error("Error fetching shops:", err);
      setError(err.message);
      message.error(`Failed to load shop records: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (token) {
      fetchData(currentPage, pageSize, searchQuery);
    }
  }, [currentPage, pageSize, searchQuery, token, fetchData]);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const refresh = () => fetchData(currentPage, pageSize, searchQuery);

  return {
    shops,
    isLoading,
    error,
    totalItems,
    currentPage,
    pageSize,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    handleTableChange,
    refresh,
  };
}
