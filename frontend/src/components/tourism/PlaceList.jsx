// Lists places fetched from web API later
// Tourism & leisure addon

import React from "react";
import PlaceCard from "./PlaceCard";

export default function PlacesList() {
  return (
    <>
      <PlaceCard name="Famous Mall" />
      <PlaceCard name="Historic Place" />
    </>
  );
}
