import { ENDPOINT, LIMIT } from "./const.js";

const teachersRow = document.querySelector(".teacher-cards");
const searchInput = document.querySelector(".search-input");
const filterSelect = document.querySelector(".teacher-select");
const pagination = document.querySelector(".pagination");
const marrySelect = document.querySelector(".marry-select");
const teacherForm = document.querySelector(".teacher-form");
const teacherModal = document.querySelector("#teacher");
const modalOpen = document.querySelector(".modal-open-btn");
const loading = document.querySelector(".loading");

loading.innerHTML = `
     <div class="atom">
        <div class="line line-1"></div>
        <div class="line line-2"></div>
        <div class="line line-3"></div>
     </div>
`

let search = "";
let activePage = 1;
let filter = "";
let isMarried = "";
let selected = null;

function getTeacherRow({
  firstName,
  groups,
  phoneNumber,
  email,
  telegram,
  twitter,
  lastNmae,
  github,
  avatar,
  field,
  isMarried,
  id,
}) {
  return `
    <div class="teacher-card">
        <div class="image-card">
            <img class="teacher-img" src=${avatar} alt="">
            <div class="social-media">
                <a href="${telegram}">
                   <img src="../images/facebook.svg">
                </a>
                <a href="${twitter}">
                   <img src="../images/twitter.svg">
                </a>
                <a href="${github}">
                   <img src="../images/github.svg">
                </a>
            </div>
            <div scope="col" class="card-btn">
               <button class="btn btn-primary delete-teacher-btn" teacherId=${id} ><img src="../images/delete.svg"></button>
               <button class="btn btn-primary edit-teacher-btn" data-bs-toggle="modal" data-bs-target="#teacher" teacherId=${id}><img src="../images/eidt.svg"></button>
            </div>
        </div>
        <div class="teacher-card-info">
            <p class="first-name">${firstName}</p>
            <p class="last-name">${lastNmae}</p>
            <p class="subject-title">Specialist :<span class="group">${field}</span></>
            <p >isMarried:<span>${isMarried ? "Marriage" : "Single"}</span></p>
            <p class="phone-title">Phone:<span class="phone-number">${phoneNumber}</span></>
            <p class="email-title">Email:<a href="${email}" class="email">${email}</a></>
            <p class="group-title">Groups:<span class="group">${groups}</span></>
            <a class="studenst-link" href="../pages/students.html?id=${id}">See students</a>
        </div>
        
    </div>
    `;
}

async function getTeachers() {
  teachersRow.innerHTML = "Loading...";

  try {
    const [filterField, order] = filter.split("-");

    const params = {
      firstName: search,
      page: activePage,
      limit: LIMIT,
      sortBy: filterField,
      order,
      isMarried,
    };

    let query = new URLSearchParams(params);

    history.pushState({}, "", `index.html?${query}`);

    // const {data:teachers} = await axios.get(`${ENDPOINT}teacher` , {params})

    // const {data:allTeachers} = await axios.get(`${ENDPOINT}teacher` , {params:{search}})

    const p1 = await axios.get(`${ENDPOINT}teacher`, { params });

    const p2 = await axios.get(`${ENDPOINT}teacher`, {
      params: { search, isMarried },
    });

    let teachers, allTeachers;

    [{ data: teachers }, { data: allTeachers }] = await Promise.all([p1, p2]);

    const pages = Math.ceil(allTeachers.length / LIMIT);

    if (pages > 1) {
      pagination.innerHTML = `<li class="page-item ${
        activePage === 1 ? "disabled" : ""
      }"><button class="page-link">Previous</button></li>`;

      for (let i = 1; i <= pages; i++) {
        pagination.innerHTML += `<li class="page-item ${
          i === activePage ? "active" : ""
        }"><button class="page-link">${i}</button></li>`;
      }

      pagination.innerHTML += `<li class="page-item ${
        activePage === pages ? "disabled" : ""
      }"><button class="page-link">Next</button></li>`;

      const paginationItems = document.querySelectorAll(".page-link");

      paginationItems.forEach((item, i) => {
        if (i === 0) {
          item.addEventListener("click", () => {
            getPage("-");
          });
        } else if (i === paginationItems.length - 1) {
          item.addEventListener("click", () => {
            getPage("+");
          });
        } else {
          item.addEventListener("click", () => {
            getPage(i);
          });
        }
      });

      function getPage(i) {
        if (i === "+") {
          activePage++;
        } else if (i === "-") {
          activePage--;
        } else {
          activePage = i;
        }
        getTeachers();
      }
    } else {
      pagination.innerHTML = "";
    }

    teachersRow.innerHTML = "";

    teachers.map((teacher) => {
      teachersRow.innerHTML += getTeacherRow(teacher);
    });

    const editTeacherBtns = document.querySelectorAll(".edit-teacher-btn");
    const deleteTeacherBtns = document.querySelectorAll(".delete-teacher-btn");

    editTeacherBtns.forEach((editBtn) => {
      editBtn.addEventListener("click", async function () {
        selected = this.getAttribute("teacherId");
        let { data: teacher } = await axios.get(
          `${ENDPOINT}teacher/${selected}`
        );
        console.log(await axios.get(`${ENDPOINT}teacher/${selected}`));
        teacherForm.elements.firstName.value = teacher.firstName;
        teacherForm.elements.avatar.value = teacher.avatar;
        teacherForm.elements.phoneNumber.value = teacher.phoneNumber;
        teacherForm.elements.email.value = teacher.email;
        teacherForm.elements.github.value = teacher.github;
        teacherForm.elements.facebook.value = teacher.facebook;
        teacherForm.elements.twitter.value = teacher.twitter;
        teacherForm.elements.isMarried.checked = teacher.isMarried;
      });
    });

    deleteTeacherBtns.forEach((deleteBtn) => {
      deleteBtn.addEventListener("click", async function () {
        let check = window.confirm("Do yo want to delete this teacher?");
        if (check) {
          const teacherId = this.getAttribute("teacherId");
          await axios.delete(`${ENDPOINT}teacher/${teacherId}`);
          getTeachers();
          activePage = 1;
        }
      });
    });
    loading.style.display = "none"
  } catch (err) {
    // teachersRow.innerHTML = err?.response?.data;
    console.log(err);
  }
}

getTeachers();

searchInput.addEventListener("keyup", function () {
  search = this.value;
  getTeachers();
  addQuery();
});

filterSelect.addEventListener("change", function () {
  filter = this.value;
  getTeachers();
});

marrySelect.addEventListener("change", function () {
  if (this.value === "true") {
    isMarried = true;
  } else if ((this.value = "false")) {
    isMarried = false;
  } else {
    isMarried = "";
  }
  getTeachers();
});

teacherForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (this.checkValidity()) {
    let teacher = {
      firstName: this.elements.firstName.value,
      lastNmae: this.elements.lastName.value,
      avatar: this.elements.avatar.value,
      isMarried: this.elements.isMarried.checked,
      groups: this.groups.value.split(" , "),
      phoneNumber: this.elements.phoneNumber.value,
      email: this.elements.email.value,
      facebook: this.elements.facebook.value,
      twitter: this.elements.twitter.value,
      github: this.elements.github.value,
    };
    if (selected === null) {
      await axios.post(`${ENDPOINT}teacher`, teacher);
    } else {
      await axios.put(`${ENDPOINT}teacher/${selected}`, teacher);
    }
    getTeachers();
    bootstrap.Modal.getInstance(teacherModal).hide();
    this.reset();
  } else {
    this.classList.add("was-validated");
  }

  console.log(teacher);
});
