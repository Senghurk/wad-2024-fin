"use client";
import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function CustomerPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerData, setCustomerData] = useState({
    name: "",
    dateOfBirth: "",
    memberNumber: "",
    interests: "",
  });
  const [snackbar, setSnackbar] = useState(null);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
  }, []);

  const columns = [
    { field: "name", headerName: "Name", width: 130 },
    {
      field: "dateOfBirth",
      headerName: "Date of Birth",
      width: 130,
      valueGetter: (params) => formatDate(params.row?.dateOfBirth),
    },
    { field: "memberNumber", headerName: "Member Number", width: 130 },
    { field: "interests", headerName: "Interests", width: 200 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleDetailsClick(params.row)} size="small">
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => handleEditClick(params.row)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)} size="small">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/customer`);
      if (!response.ok) throw new Error(`Failed to fetch customers: ${response.status}`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setSnackbar({ children: `Error fetching customers: ${error.message}`, severity: "error" });
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpen = () => {
    setSelectedCustomer(null);
    setCustomerData({ name: "", dateOfBirth: "", memberNumber: "", interests: "" });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCustomer(null);
    setCustomerData({ name: "", dateOfBirth: "", memberNumber: "", interests: "" });
  };

  const handleDetailsClick = (customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedCustomer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const url = selectedCustomer ? `${API_BASE}/customer/${selectedCustomer._id}` : `${API_BASE}/customer`;
      const method = selectedCustomer ? "PUT" : "POST";
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) throw new Error(`Failed to ${selectedCustomer ? "update" : "add"} customer: ${response.status}`);

      const updatedCustomer = await response.json();
      setCustomers((prev) => 
        selectedCustomer 
          ? prev.map((c) => (c._id === updatedCustomer._id ? updatedCustomer : c))
          : [...prev, updatedCustomer]
      );

      handleClose();
      setSnackbar({
        children: `Customer ${selectedCustomer ? "updated" : "added"} successfully`,
        severity: "success",
      });
    } catch (error) {
      console.error(`Error ${selectedCustomer ? "updating" : "adding"} customer:`, error);
      setSnackbar({
        children: `Error ${selectedCustomer ? "updating" : "adding"} customer: ${error.message}`,
        severity: "error",
      });
    }
  };

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setCustomerData({
      name: customer.name,
      dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split("T")[0] : "",
      memberNumber: customer.memberNumber,
      interests: customer.interests,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const response = await fetch(`${API_BASE}/customer/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Failed to delete customer: ${response.status}`);
      setCustomers((prev) => prev.filter((customer) => customer._id !== id));
      setSnackbar({ children: "Customer deleted successfully", severity: "success" });
    } catch (error) {
      console.error("Error deleting customer:", error);
      setSnackbar({ children: `Error deleting customer: ${error.message}`, severity: "error" });
    }
  };

  const handleCloseSnackbar = () => setSnackbar(null);

  return (
    <div className="m-4">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <Button onClick={handleOpen} variant="contained" color="primary" className="mb-4">
        Add New Customer
      </Button>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={customers}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row) => row._id}
        />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={customerData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            fullWidth
            variant="standard"
            InputLabelProps={{ shrink: true }}
            value={customerData.dateOfBirth}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="memberNumber"
            label="Member Number"
            type="number"
            fullWidth
            variant="standard"
            value={customerData.memberNumber}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="interests"
            label="Interests"
            type="text"
            fullWidth
            variant="standard"
            value={customerData.interests}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{selectedCustomer ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailsOpen} onClose={handleCloseDetails}>
        <DialogTitle>Customer Details</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <>
              <Typography><strong>Name:</strong> {selectedCustomer.name}</Typography>
              <Typography><strong>Date of Birth:</strong> {formatDate(selectedCustomer.dateOfBirth)}</Typography>
              <Typography><strong>Member Number:</strong> {selectedCustomer.memberNumber}</Typography>
              <Typography><strong>Interests:</strong> {selectedCustomer.interests}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {!!snackbar && (
        <Snackbar
          open
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          onClose={handleCloseSnackbar}
          autoHideDuration={6000}
        >
          <Alert {...snackbar} onClose={handleCloseSnackbar} />
        </Snackbar>
      )}
    </div>
  );
}