// Confirms whether work is completed
// Handles optional revenue and rating

import React, { useState } from "react";

export default function CompletionConfirmation() {
  const [revenue, setRevenue] = useState("");

  return (
    <div>
      <p>Have you completed this work?</p>
      <button>Yes</button>
      <button>No</button>

      <input
        placeholder="Revenue earned (optional)"
        value={revenue}
        onChange={(e) => setRevenue(e.target.value)}
      />
    </div>
  );
}
