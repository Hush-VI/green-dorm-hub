// UMaT programmes and academic levels

export const LEVELS = ["100", "200", "300", "400"];

export const COURSES: { faculty: string; programmes: string[] }[] = [
  {
    faculty: "Faculty of Mining and Minerals Technology",
    programmes: [
      "BSc Mining Engineering",
      "BSc Minerals Engineering",
    ],
  },
  {
    faculty: "Faculty of Engineering",
    programmes: [
      "BSc Mechanical Engineering",
      "BSc Electrical and Electronic Engineering",
      "BSc Renewable Energy Engineering",
      "BSc Telecommunication Engineering",
      "Diploma in Plant and Maintenance Engineering",
      "Diploma in Electrical and Electronic Engineering",
    ],
  },
  {
    faculty: "Faculty of Computing and Mathematical Sciences",
    programmes: [
      "BSc Cyber Security",
      "BSc Computer Science and Engineering",
      "BSc Information Systems and Technology",
      "BSc Mathematics",
      "BSc Statistical Data Science",
      "BSc Robotics Engineering and Artificial Intelligence",
    ],
  },
  {
    faculty: "Faculty of Integrated Management Studies",
    programmes: [
      "BSc Logistics and Transport Management",
      "BSc Economics and Industrial Organisation",
      "BSc Finance and Data Science",
    ],
  },
  {
    faculty: "Faculty of Geosciences and Environmental Studies",
    programmes: [
      "BSc Geomatic Engineering",
      "BSc Geological Engineering",
      "BSc Spatial Planning",
      "BSc Environmental and Safety Engineering",
      "BSc Land Administration and Information Systems",
      "Diploma in General Drilling",
    ],
  },
  {
    faculty: "School of Petroleum Studies",
    programmes: [
      "BSc Petroleum Engineering",
      "BSc Natural Gas Engineering",
      "BSc Petroleum Geosciences and Engineering",
      "BSc Petroleum Refining and Petrochemical Engineering",
      "BSc Chemical Engineering",
    ],
  },
];

// Flat list for simple dropdowns
export const ALL_COURSES = COURSES.flatMap((f) => f.programmes);
