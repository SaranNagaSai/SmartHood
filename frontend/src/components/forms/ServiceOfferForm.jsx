// Allows users to offer services
// Used by professionals and students

import React, { useState } from "react";

export default function ServiceOfferForm() {
  const [skill, setSkill] = useState("");

  return (
    <form>
      <input
        placeholder="Your skill / service"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        required
      />
      <button>Offer Service</button>
    </form>
  );
}
