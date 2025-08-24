import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AgGridReact } from 'ag-grid-react';
import { 
  Plus, 
  Search, 
  Filter, 
  LogOut, 
  User, 
  Building, 
  TrendingUp, 
  Users,
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  CheckCircle
} from 'lucide-react';
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
    status: 'all',
    source: 'all',
    score_min: '',
    score_max: ''
  });

  // Fetch leads with filters
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.source !== 'all') params.append('source', filters.source);
      if (filters.score_min) params.append('score_min', filters.score_min);
      if (filters.score_max) params.append('score_max', filters.score_max);

      const response = await axios.get(`/api/leads?${params.toString()}`);
      if (response.data.success) {
        setLeads(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Debounce search filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search, fetchLeads]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, navigate]);

  const handleEdit = useCallback((leadId) => {
    navigate(`/leads/${leadId}/edit`);
  }, [navigate]);

  const handleDelete = useCallback(async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const response = await axios.delete(`/api/leads/${leadId}`);
        if (response.data.success) {
          toast.success('Lead deleted successfully');
          fetchLeads();
        }
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  }, [fetchLeads]);

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Lead',
      field: 'first_name',
      cellRenderer: (params) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {params.data.first_name} {params.data.last_name}
            </div>
            <div className="text-sm text-gray-500">{params.data.email}</div>
          </div>
        </div>
      ),
      width: 200,
      filter: false
    },
    {
      headerName: 'Company',
      field: 'company',
      cellRenderer: (params) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">{params.data.company || 'N/A'}</span>
        </div>
      ),
      width: 150,
      filter: false
    },
    {
      headerName: 'Location',
      field: 'city',
      cellRenderer: (params) => (
        <div className="text-gray-900">
          {params.data.city}, {params.data.state}
        </div>
      ),
      width: 120,
      filter: false
    },
    {
      headerName: 'Source',
      field: 'source',
      cellRenderer: (params) => {
        const sourceClasses = {
          website: 'source-website',
          facebook_ads: 'source-facebook_ads',
          google_ads: 'source-google_ads',
          referral: 'source-referral',
          events: 'source-events',
          other: 'source-other'
        };
        return (
          <span className={`source-badge ${sourceClasses[params.data.source] || 'source-other'}`}>
            {params.data.source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        );
      },
      width: 130,
      filter: false
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: (params) => {
        const statusClasses = {
          new: 'status-new',
          contacted: 'status-contacted',
          qualified: 'status-qualified',
          won: 'status-won',
          lost: 'status-lost'
        };
        return (
          <span className={`status-badge ${statusClasses[params.data.status] || 'status-new'}`}>
            {params.data.status.charAt(0).toUpperCase() + params.data.status.slice(1)}
          </span>
        );
      },
      width: 120,
      filter: false
    },
    {
      headerName: 'Score',
      field: 'score',
      cellRenderer: (params) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${params.data.score}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-900">{params.data.score}</span>
        </div>
      ),
      width: 120,
      filter: false
    },
    {
      headerName: 'Value',
      field: 'lead_value',
      cellRenderer: (params) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-900">
            {params.data.lead_value ? `$${params.data.lead_value.toLocaleString()}` : 'N/A'}
          </span>
        </div>
      ),
      width: 120,
      filter: false
    },
    {
      headerName: 'Last Activity',
      field: 'last_activity_at',
      cellRenderer: (params) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {params.data.last_activity_at ? new Date(params.data.last_activity_at).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      ),
      width: 140,
      filter: false
    },
    {
      headerName: 'Actions',
      cellRenderer: (params) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(params.data.id)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(params.data.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            Delete
          </button>
        </div>
      ),
      width: 150,
      filter: false
    }
  ], [handleEdit, handleDelete]);

  // AG Grid default column properties
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    suppressMenu: true
  }), []);

  // Calculate dashboard stats
  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'new').length;
    const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
    const wonLeads = leads.filter(lead => lead.status === 'won').length;
    const totalValue = leads.reduce((sum, lead) => sum + (lead.lead_value || 0), 0);
    const avgScore = total > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / total) : 0;

    return { total, newLeads, qualifiedLeads, wonLeads, totalValue, avgScore };
  }, [leads]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Building className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900">Erino</span>
                  <span className="text-sm text-gray-500">Lead Management System</span>
                </div>
              </div>
              <div className="hidden md:block h-8 w-px bg-gray-300"></div>
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your leads efficiently</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="card hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newLeads}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Qualified</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.qualifiedLeads}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Won</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.wonLeads}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgScore}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="card mb-6">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Filters & Actions</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters({ search: '', status: 'all', source: 'all', score_min: '', score_max: '' })}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              {/* Filters Section */}
              <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-6">
                {/* Search */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="form-input pl-10 w-full lg:w-72"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="form-select w-full lg:w-44"
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                {/* Source Filter */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">Source</label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="form-select w-full lg:w-44"
                  >
                    <option value="all">All Sources</option>
                    <option value="website">Website</option>
                    <option value="facebook_ads">Facebook Ads</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="referral">Referral</option>
                    <option value="events">Events</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Score Range */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">Score Range</label>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.score_min}
                        onChange={(e) => setFilters(prev => ({ ...prev, score_min: e.target.value }))}
                        className="form-input w-20 text-center"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">0-100</span>
                    </div>
                    <span className="text-gray-400 font-medium">to</span>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.score_max}
                        onChange={(e) => setFilters(prev => ({ ...prev, score_max: e.target.value }))}
                        className="form-input w-20 text-center"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">0-100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add New Lead Button */}
              <div className="flex justify-center lg:justify-end">
                <button
                  onClick={() => navigate('/leads/new')}
                  className="btn-primary w-full lg:w-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Lead
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Lead Management</h3>
          </div>
          <div className="card-body p-0">
            <div className="ag-theme-alpine w-full" style={{ height: '600px' }}>
              <AgGridReact
                columnDefs={columnDefs}
                rowData={leads}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
                suppressFilterPanel={true}
                suppressMenuHide={false}
                suppressColumnFilter={true}
                rowSelection="single"
                animateRows={true}
                domLayout="autoHeight"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
