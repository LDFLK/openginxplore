const mockBodiesData = {
  default: [
    { name: "Board of Directors" },
    { name: "Regional Office" },
    { name: "Advisory Committee" },
    { name: "Executive Committee" },
    { name: "Finance Committee" },
    { name: "Audit Committee" },
    { name: "Steering Committee" },
    { name: "Technical Evaluation Committee" },
    { name: "Provincial Office" },
    { name: "District Office" },
    { name: "Divisional Secretariat" },
    { name: "Procurement Committee" },
    { name: "Disciplinary Committee" },
    { name: "Research and Development Unit" },
    { name: "Monitoring and Evaluation Unit" },
  ],
};

export const getMockBodiesByDepartment = (departmentId) => {
  const bodies = mockBodiesData[departmentId] || mockBodiesData.default;
  return bodies.map((body, idx) => ({
    id: `${departmentId}-body-${idx}`,
    ...body,
  }));
};

export default mockBodiesData;
