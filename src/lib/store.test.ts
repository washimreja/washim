import { beforeEach, describe, expect, it } from "vitest";
import {
  addPlan,
  activityLabel,
  bootstrapUser,
  currentUser,
  endSession,
  findUser,
  getPlan,
  hashPassword,
  listPlans,
  newUser,
  registerUser,
  removePlan,
  savePlans,
  setPlanShared,
  startSession,
  updateUser,
  verifyPassword,
} from "@/lib/store";

beforeEach(() => {
  localStorage.clear();
});

describe("hashPassword", () => {
  it("is deterministic and never equals the plaintext", () => {
    expect(hashPassword("hunter2")).toBe(hashPassword("hunter2"));
    expect(hashPassword("hunter2")).not.toBe("hunter2");
    expect(hashPassword("a")).not.toBe(hashPassword("b"));
  });
});

describe("users", () => {
  it("registers a user and finds them case-insensitively", () => {
    const user = registerUser("Ada", "Ada@Example.com", "pw123456");
    expect(user.profile.name).toBe("Ada");
    expect(findUser("ada@example.com")!.profile.email).toBe("Ada@Example.com");
  });

  it("refuses duplicate emails", () => {
    registerUser("Ada", "ada@example.com", "pw1");
    expect(() => registerUser("Copy", "ada@example.com", "pw2")).toThrow(/already exists/i);
  });

  it("never stores plaintext passwords", () => {
    const user = registerUser("Ada", "ada@example.com", "hunter2");
    expect(user.passwordHash).not.toBe("hunter2");
    expect(verifyPassword(user, "hunter2")).toBe(true);
    expect(verifyPassword(user, "hunter3")).toBe(false);
  });

  it("starts every profile with sane defaults", () => {
    const user = newUser("Solo", "solo@example.com");
    expect(user.profile.homePlace).toBeNull();
    expect(user.profile.favorites).toEqual([]);
    expect(user.profile.comfort.heatC).toBe(28);
    expect(user.profile.comfort.coldC).toBe(5);
    expect(user.profile.activityWeights.running).toBe(0.85);
    expect(user.profile.interactions).toBe(0);
  });

  it("applies profile patches via updateUser", () => {
    registerUser("Ada", "ada@example.com", "pw1");
    const updated = updateUser("ada@example.com", (p) => ({ ...p, name: "Ada L." }));
    expect(updated?.profile.name).toBe("Ada L.");
    expect(findUser("ada@example.com")!.profile.name).toBe("Ada L.");
    expect(updateUser("missing@example.com", (p) => p)).toBeNull();
  });
});

describe("sessions", () => {
  it("persists a session and resolves currentUser", () => {
    registerUser("Ada", "ada@example.com", "pw1");
    expect(currentUser()).toBeNull(); // signed out before the session starts
    startSession("ada@example.com");
    expect(currentUser()?.profile.email).toBe("ada@example.com");
    endSession();
    expect(currentUser()).toBeNull();
  });

  it("drops sessions whose user no longer exists", () => {
    startSession("ghost@example.com");
    expect(currentUser()).toBeNull();
  });
});

describe("bootstrapUser", () => {
  it("seeds the demo account once and signs in on an existing session", () => {
    expect(bootstrapUser()).toBeNull(); // no session yet, but demo now exists
    const demo = findUser("demo@skysense.app");
    expect(demo).not.toBeNull();
    expect(verifyPassword(demo!, "demo1234")).toBe(true);

    startSession("demo@skysense.app");
    expect(bootstrapUser()?.profile.email).toBe("demo@skysense.app");
    // Seeding is idempotent — the demo password survives re-bootstraps.
    expect(verifyPassword(findUser("demo@skysense.app")!, "demo1234")).toBe(true);
  });
});

describe("plans", () => {
  const plan = {
    id: "p_test",
    title: "Test plan",
    note: "",
    when: "2026-09-22T10:00",
    placeName: "Home",
    activity: "running",
    createdAt: 0,
  };

  it("seeds two starter plans on first read", () => {
    expect(listPlans()).toHaveLength(2);
  });

  it("adds, shares, and removes plans", () => {
    savePlans([]);
    addPlan({ ...plan });
    addPlan({ ...plan, id: "p_test_2" });
    expect(listPlans().map((p) => p.id)).toEqual(["p_test_2", "p_test"]);

    setPlanShared("p_test", true);
    expect(getPlan("p_test")!.shared).toBe(true);
    expect(getPlan("p_test_2")!.shared).toBeUndefined();

    removePlan("p_test");
    expect(getPlan("p_test")).toBeNull();
    expect(listPlans()).toHaveLength(1);
  });

  it("returns null for unknown plan ids", () => {
    expect(getPlan("nope")).toBeNull();
  });

  it("labels known activities and passes through unknown ids", () => {
    expect(activityLabel("running")).toBe("Running");
    expect(activityLabel("mystery")).toBe("mystery");
  });
});
