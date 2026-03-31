import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { useAuth } from "../auth/AuthProvider";
import { API_BASE_URL } from "./config";

const BASE_URL = `${API_BASE_URL}/companies`;

/**
 * Hook for managing company records.
 * Adapted from reference useCompaniesRecord logic.
 */
export function useCompanies() {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); // Ant Design uses 1-based
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // GET: Fetch Companies
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

      // Add companyId if available
      if (user?.companyId) {
        queryParams.append("companyId", user.companyId.toString());
      }

      // For FINANCE users, handle role-specific logic
      const roles = Array.isArray(user?.role) ? user.role : (user?.role ? [user.role] : []);
      if (roles.includes("FINANCE")) {
        queryParams.append("userRole", "FINANCE");
      }

      const url = `${BASE_URL}?${queryParams}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Special handling for FINANCE users
        if (roles.includes("FINANCE") && errorText.includes("Company id not found")) {
          throw new Error("Your FINANCE account is not properly linked to a company.");
        }

        throw new Error(errorText || "Failed to fetch companies");
      }

      const result = await response.json();
      setCompanies(result.content || (Array.isArray(result) ? result : []));
      setTotalItems(result.totalElements || result.pageable?.totalElements || (Array.isArray(result) ? result.length : 0));
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError(err.message);
      message.error(`Failed to load companies record: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  // POST: Create Company
  const addCompany = async (data) => {
    try {
      setIsLoading(true);
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create company");
      }

      const result = await response.json();
      message.success("Company created successfully");
      fetchData(currentPage, pageSize, searchQuery);
      return result;
    } catch (err) {
      console.error("Create Error:", err);
      message.error(err.message || "Failed to create company");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // PUT: Update Company
  const updateCompany = async (data) => {
    try {
      setIsLoading(true);
      const response = await fetch(BASE_URL, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update company");
      }

      const result = await response.json();
      message.success("Company updated successfully");
      fetchData(currentPage, pageSize, searchQuery);
      return result;
    } catch (err) {
      console.error("Update Error:", err);
      message.error(err.message || "Failed to update company");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE: Delete Company
  const deleteCompany = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to delete company");
      message.success("Company deleted");
      fetchData(currentPage, pageSize, searchQuery);
    } catch (err) {
      message.error(err.message || "Failed to delete company");
    }
  };

  // POST/PUT: Account updates
  const updateAccount = async (id, bankAccounts) => {
    try {
      const response = await fetch(`${BASE_URL}/account/${id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bankAccounts),
      });
      if (!response.ok) throw new Error("Failed to update bank accounts");
      // Don't show success message here as it's usually part of a larger update
      return true;
    } catch (err) {
      console.error("Account Update Error:", err);
      message.error(err.message || "Failed to update accounts");
      return false;
    }
  };

  /**
   * PUT: Update a specific bank account by its ID
   * Endpoint: /finance-payment-confirmation/api/v1/companies/account/{bankAccountId}
   * Body: [ { bankAccountId, bankName, accountHolder, accountNumber } ]
   */
  const updateSingleAccount = async (companyId, accountData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/account/${companyId}`, {
        method: "PUT", // Using PUT for specific ID update
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify([accountData]), // Send as an array containing the single account
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update bank account");
      }
      return true;
    } catch (err) {
      console.error("Single Account Update Error:", err);
      message.error(`Failed to update account ${accountData.bankName}: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData(currentPage, pageSize, searchQuery);
    }
  }, [currentPage, pageSize, searchQuery, token, fetchData]);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return {
    companies,
    isLoading,
    error,
    totalItems,
    currentPage,
    pageSize,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    handleTableChange,
    refresh: () => fetchData(currentPage, pageSize, searchQuery),
    addCompany,
    updateCompany,
    deleteCompany,
    updateAccount,
    updateSingleAccount
  };
}
