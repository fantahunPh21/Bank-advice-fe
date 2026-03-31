import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { API_BASE_URL } from "./config";
import { useAuth } from "../auth/AuthProvider";

const BASE_URL = `${API_BASE_URL}/payment-records`;

export function usePaymentRecords(initialPage = 0, initialPageSize = 10) {
  const { token, user } = useAuth();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});

  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalElements: 0,
    pageSize: initialPageSize,
  });

  const fetchData = useCallback(async (page = 0, size = initialPageSize, keyword = searchQuery) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log("🔍 Payment Records - User context:", {
        user,
        roles: user?.role,
        companyId: user?.companyId,
      });

      // Build query parameters
      const queryParams = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: size.toString(),
      });

      if (keyword) {
        queryParams.append("keyword", keyword);
      }

      // Add user context
      const userId = user?.uuid || user?.id;
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
          console.log("⚠️ FINANCE user without companyId - requesting all companies data");
        }
      } else if (user?.companyId) {
        queryParams.append("companyId", user.companyId.toString());
      }

      // Merge advanced filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${BASE_URL}?${queryParams}`;

      const fetchOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      let response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();

        // Retry logic for FINANCE users without companyId
        if (response.status !== 200 && roles.includes("FINANCE") && !user?.companyId && errorText.includes("Company id not found")) {
          console.log("🔄 Retrying without company-specific parameters for FINANCE user...");
          const retryParams = new URLSearchParams({
            pageNumber: page.toString(),
            pageSize: size.toString(),
            userRole: "FINANCE",
          });
          if (userId) retryParams.append("userId", userId.toString());
          if (keyword) retryParams.append("keyword", keyword);

          const retryUrl = `${BASE_URL}?${retryParams}`;
          response = await fetch(retryUrl, fetchOptions);
        }

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('ce_token');
            localStorage.removeItem('ce_user');
            window.location.href = "/login";
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(errorText || `Error ${response.status}: Failed to fetch payment records`);
        }
      }

      const result = await response.json();

      if (result.status === 200 && result.content) {
        setRecords(result.content);
        setPagination({
          currentPage: page,
          totalPages: result.pageable?.totalPages || 1,
          totalElements: result.pageable?.totalElements || result.content.length,
          pageSize: size,
        });
      } else if (result.content) {
        // Alternative structure
        setRecords(result.content);
        setPagination(prev => ({ ...prev, totalElements: result.totalElements || result.content.length }));
      }
    } catch (err) {
      console.error("💥 Error fetching payment records:", err);
      if (err.message.includes("Company id not found")) {
        setRecords([]);
        setPagination(prev => ({ ...prev, totalElements: 0, totalPages: 0 }));
      } else {
        setError(err.message);
        message.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, user, initialPageSize, searchQuery, filters]);

  // Function to handle advanced filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filtering
    fetchData(0, pagination.pageSize, searchQuery);
  }, [fetchData, pagination.pageSize, searchQuery]);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    fetchData(0, pagination.pageSize, "");
  }, [fetchData, pagination.pageSize]);

  // Function to change the page
  const goToPage = (page) => {
    fetchData(page, pagination.pageSize, searchQuery);
  };

  // Function to change the page size
  const changePageSize = (newSize) => {
    fetchData(0, newSize, searchQuery);
  };

  // Function to refresh the current page
  const refreshRecords = useCallback(() => {
    fetchData(pagination.currentPage, pagination.pageSize, searchQuery);
  }, [fetchData, pagination.currentPage, pagination.pageSize, searchQuery]);

  // Handle Search
  const handleSearch = (value) => {
    setSearchQuery(value);
    fetchData(0, pagination.pageSize, value);
  };

  // CRUD Methods
  const addRecord = async (data) => {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      message.success("Payment record created successfully");
      refreshRecords();
    } catch (err) {
      message.error("Failed to create payment record");
    }
  };

  const updateRecord = async (data) => {
    try {
      const response = await fetch(BASE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      message.success("Payment record updated successfully");
      refreshRecords();
    } catch (err) {
      message.error("Failed to update payment record");
    }
  };

  const deleteRecord = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
      message.success("Payment record deleted");
      refreshRecords();
    } catch (err) {
      message.error("Failed to delete payment record");
    }
  };

  const closePaymentRecord = async (id, finalRemark) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/closePaymentRecord`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ finalRemark }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to close payment record");
      }
      message.success("Payment record has been closed successfully");
      refreshRecords();
    } catch (err) {
      message.error(err.message || "Failed to close payment record");
      throw err;
    }
  };

  const voidLine = async (paymentRecordLineId, voidReason) => {
    try {
      const response = await fetch(`${BASE_URL}/${paymentRecordLineId}/voidLine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ voidReason }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to void payment line");
      }
      message.success("Payment line has been voided successfully");
      refreshRecords();
    } catch (err) {
      message.error(err.message || "Failed to void payment line");
      throw err;
    }
  };

  const requestLineOtp = async (paymentRecordLineId, action, transactionReference, recordId) => {
    try {
      const isReject = action === 'reject';
      const finalUserId = user?.userId || user?.uuid || user?.id || 1;
      const urlAction = isReject ? 'reject' : 'confirm';
      
      const response = await fetch(`${BASE_URL}/lines/${paymentRecordLineId}/request-${urlAction}-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionReference,
          userId: Number(finalUserId)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Handle nested error message from backend
        const errorMessage = errorData.content?.message || errorData.message || "Failed to request OTP";
        throw new Error(errorMessage);
      }

      message.success(`OTP requested for ${action} successfully`);
      return true;
    } catch (err) {
      message.error(err.message || `Failed to request ${action} OTP`);
      return false;
    }
  };

  const verifyLineAction = async (paymentRecordLineId, action, otpCode, remarks = "", recordId) => {
    try {
      // Use signed-in user ID for all actions
      const isReject = action === 'reject';
      const finalUserId = user?.userId || user?.uuid || user?.id || 1;
      const endpoint = `${BASE_URL}/lines/${paymentRecordLineId}/${isReject ? 'reject-with-otp' : 'confirm-with-otp'}`;
      
      const body = {
        userId: Number(finalUserId),
        otpCode,
      };

      if (isReject) {
        body.rejectionReason = remarks;
      } else {
        body.remarks = remarks;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Handle nested error message from backend (e.g. content.message)
        const errorMessage = errorData.content?.message || errorData.message || `Failed to ${action} payment line`;
        throw new Error(errorMessage);
      }

      message.success(`Payment line ${action}ed successfully`);
      refreshRecords();
      return true;
    } catch (err) {
      console.error(`${action} line error:`, err);
      message.error(err.message || `Failed to ${action} payment line`);
      return false;
    }
  };

  useEffect(() => {
    fetchData(initialPage, initialPageSize, searchQuery);

    const handleRefreshEvent = () => {
      message.loading({ content: "Refreshing records...", key: "refreshing" });
      refreshRecords();
      setTimeout(() => message.success({ content: "Records updated", key: "refreshing" }), 1000);
    };

    window.addEventListener("refreshData", handleRefreshEvent);
    return () => {
      window.removeEventListener("refreshData", handleRefreshEvent);
    };
  }, [initialPage, initialPageSize, fetchData]);

  return {
    records,
    isLoading,
    error,
    pagination,
    searchQuery,
    changePageSize,
    refreshRecords,
    handleSearch,
    handleFilterChange,
    resetFilters,
    filters,
    addRecord,
    updateRecord,
    deleteRecord,
    closePaymentRecord,
    voidLine,
    requestLineOtp,
    verifyLineAction
  };
}
