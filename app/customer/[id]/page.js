"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, Typography } from "@mui/material";

export default function CustomerDetailPage() {
  const [customer, setCustomer] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    const res = await fetch(`/api/customer/${id}`);
    const data = await res.json();
    setCustomer(data);
  };

  if (!customer) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            {customer.name}
          </Typography>
          <Typography color="text.secondary">
            Date of Birth: {new Date(customer.dateOfBirth).toLocaleDateString()}
          </Typography>
          <Typography color="text.secondary">
            Member Number: {customer.memberNumber}
          </Typography>
          <Typography color="text.secondary">
            Interests: {customer.interests}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
