export class RoleKeeper {
  #roles;
  #unassigned;
  #guests;
  #me;
  #boundUpdate; // holds a bound version of the update function
  #autoAssign;

  constructor(roles = [1, 2], unassigned = "unassigned") {
    if (roles.length < 1) console.error("RoleKeeper: You must have at least one role!");

    this.#roles = roles;
    this.#unassigned = unassigned;
    this.#guests = partyLoadGuestShareds();
    this.#boundUpdate = this.#update.bind(this);
    this.#me = partyLoadMyShared(undefined, () => {
      this.#me._roleKeeper = { role: unassigned };
      this.#boundUpdate();
    });

    this.#autoAssign = true;
  }

  setAutoAssign(value) {
    this.#autoAssign = value;
  }

  myRole() {
    return this.#me._roleKeeper.role;
  }

  requestRole(role) {
    // allways allow unassigned
    if (role === this.#unassigned) {
      this.#me._roleKeeper.role = role;
      return true;
    }

    // if the role is not a known role, don't assign
    if (!this.#roles.includes(role)) {
      console.error(`RoleKeeper: ${role} is not a known role! (${this.#roles.join(", ")})`);
      return false;
    }

    // if requester already has role, keep it
    if (this.#me._roleKeeper.role === role) return true;

    // if the role is already taken, don't assign
    if (this.#guests.some((g) => g._roleKeeper?.role === role)) return false;

    // if the role is available, assign it
    this.#me._roleKeeper.role = role;
    return true;
  }

  guestsWithRole(role) {
    return this.#guests.filter((g) => g._roleKeeper?.role === role);
  }

  #update() {
    requestAnimationFrame(this.#boundUpdate);

    if (!this.#autoAssign) return;

    // loop through roles and assign them if needed
    this.#roles.forEach((role) => {
      // if there isn't any guest currently in this role...
      if (!this.#guests.some((g) => g._roleKeeper?.role === role)) {
        // find first unassigned guest...
        const guest = this.#guests.find((g) => g._roleKeeper?.role === this.#unassigned);
        // if that unassigned guest is me, take on the role
        if (guest === this.#me) guest._roleKeeper.role = role;
      }
    });
  }
}
