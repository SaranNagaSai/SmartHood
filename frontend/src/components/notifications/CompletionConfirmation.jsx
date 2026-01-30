// Confirms whether work is completed
// Handles optional revenue and rating

import React, { useState } from "react";
import Button from "../ui/Button";
import TextField from "../ui/TextField";

export default function CompletionConfirmation() {
  const [revenue, setRevenue] = useState("");

  return (
    <div>
      <p>Have you completed this work?</p>
      <Button type="button" size="sm">Yes</Button>
      <Button type="button" variant="secondary" size="sm">No</Button>

      <TextField
        placeholder="Revenue earned (optional)"
        value={revenue}
        onChange={(e) => setRevenue(e.target.value)}
      />
    </div>
  );
}
