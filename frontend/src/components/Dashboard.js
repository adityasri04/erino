import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, LogOut, Filter, Search, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    score_min: '',
    score_max: '',
    lead_value_min: '',
    lead_value_max: '',
    is_qualified: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Name',
      field: 'first_name',
      cellRenderer: (params) => {
        const { first_name, last_name } = params.data;
        return `${first_name} ${last_name}`;
      },
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      headerName: 'Company',
      field: 'company',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: 'Phone',
      field: 'phone',
      sortable: true,
      filter: true,
      width: 130
    },
    {
      headerName: 'City',
      field: 'city',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      headerName: 'State',
      field: 'state',
      sortable: true,
      filter: true,
      width: 100
    },
    {
      headerName: 'Source',
      field: 'source',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const source = params.value;
        const sourceColors = {
          website: 'bg-blue-100 text-blue-800',
          facebook_ads: 'bg-purple-100 text-purple-800',
          google_ads: 'bg-red-100 text-red-800',
          referral: 'bg-green-100 text-green-800',
          events: 'bg-yellow-100 text-yellow-800',
          other: 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${sourceColors[source] || sourceColors.other}`}>
            {source.replace('_', ' ')}
          </span>
        );
      },
      width: 120
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const status = params.value;
        const statusColors = {
          new: 'bg-gray-100 text-gray-800',
          contacted: 'bg-blue-100 text-blue-800',
          qualified: 'bg-yellow-100 text-yellow-800',
          won: 'bg-green-100 text-green-800',
          lost: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.new}`}>
            {status}
          </span>
        );
      },
      width: 100
    },
    {
      headerName: 'Score',
      field: 'score',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const score = params.value;
        let color = 'text-gray-600';
        if (score >= 80) color = 'text-green-600';
        else if (score >= 60) color = 'text-yellow-600';
        else color = 'text-red-600';
        
        return (
          <span className={`font-semibold ${color}`}>
            {score}/100
          </span>
        );
      },
      width: 80
    },
    {
      headerName: 'Value',
      field: 'lead_value',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        return `$${params.value?.toLocaleString() || '0'}`;
      },
      width: 100
    },
    {
      headerName: 'Qualified',
      field: 'is_qualified',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        return params.value ? (
          <span className="text-green-600">✓</span>
        ) : (
          <span className="text-gray-400">✗</span>
        );
      },
      width: 80
    },
    {
      headerName: 'Created',
      field: 'created_at',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        return new Date(params.value).toLocaleDateString();
      },
      width: 100
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(params.data.id)}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(params.data.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        );
      },
      width: 120
    }
  ], []);

  // AG Grid default column properties
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    floatingFilterComponent: 'agTextColumnFilter'
  }), []);

  // Fetch leads with filters and pagination
  const fetchLeads = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await axios.get(`/api/leads?${queryParams}`);
      
      if (response.data.success) {
        setLeads(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  // Load leads on component mount and when filters change
  useEffect(() => {
    fetchLeads(1);
  }, [fetchLeads]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchLeads(newPage);
  };

  // Handle edit lead
  const handleEdit = (id) => {
    navigate(`/leads/${id}/edit`);
  };

  // Handle delete lead
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await axios.delete(`/api/leads/${id}`);
      if (response.data.success) {
        toast.success('Lead deleted successfully');
        fetchLeads(pagination.page);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Lead Management System</h1>
              <span className="text-sm text-gray-500">Welcome, {user?.first_name}!</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/leads/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </h2>
            <button
              onClick={() => fetchLeads(1)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search leads..."
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Sources</option>
                <option value="website">Website</option>
                <option value="facebook_ads">Facebook Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.score_min}
                  onChange={(e) => handleFilterChange('score_min', e.target.value)}
                  placeholder="Min"
                  className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.score_max}
                  onChange={(e) => handleFilterChange('score_max', e.target.value)}
                  placeholder="Max"
                  className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AG Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Leads</h2>
              <div className="text-sm text-gray-500">
                Showing {leads.length} of {pagination.total} leads
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                <div className="ag-theme-alpine w-full" style={{ height: '600px' }}>
                  <AgGridReact
                    columnDefs={columnDefs}
                    rowData={leads}
                    defaultColDef={defaultColDef}
                    pagination={false}
                    paginationPageSize={pagination.limit}
                    domLayout="normal"
                    animateRows={true}
                    suppressRowClickSelection={true}
                  />
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
