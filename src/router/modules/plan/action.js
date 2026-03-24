export default [
  { 
    path: "plan/action/planning", 
    name: "Planning", 
    component: () => import("../../../pages/Explore/Plan/action/planning/index.vue"),
    meta: { role: ["1000", "30", "2000"] } 
  },
 
];