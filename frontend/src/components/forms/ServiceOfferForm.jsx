// Allows users to offer services
// Used by professionals and students

import React, { useState } from "react";
import Button from "../ui/Button";
import TextField from "../ui/TextField";

export default function ServiceOfferForm() {
  const [skill, setSkill] = useState("");

  return (
    <form>
      <TextField
        placeholder="Your skill / service"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        required
      />
      <Button type="submit">Offer Service</Button>
    </form>
  );
}
