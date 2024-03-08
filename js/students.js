import { ENDPOINT , LIMIT} from "./const.js";

const studentsRow = document.querySelector(".student-cards");
const searchInput = document.querySelector(".search-input");
const filterSelect = document.querySelector(".student-select");
const pagination =document.querySelector(".pagination");
const marrySelect = document.querySelector(".marry-select");
const studentForm = document.querySelector(".student-form");
const studentModal = document.querySelector("#student");
const modalOpen = document.querySelector('.modal-open-btn');

const query = new URLSearchParams( location.search );
let studentId = query.get('id');

console.log(studentId);

let search = "";
let activePage = 1;
let filter = "";
let isMarried = '';
let selected = null;

function getStudentRow({firstName ,degree, rating ,phoneNumber , email ,telegram , twitter, lastName ,github, avatar, field , isWork , id}){
    return `
    <div class="student-card">
        <div class="image-card">
            <img class="student-img" src=${avatar} alt="">
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
               <button class="btn btn-primary delete-student-btn" studentId=${id} ><img src="../images/delete.svg"></button>
               <button class="btn btn-primary edit-student-btn" data-bs-toggle="modal" data-bs-target="#student" studentId=${id}><img src="../images/eidt.svg"></button>
            </div>
        </div>
        <div class="student-card-info">
            <p class="first-name">${firstName}</p>
            <p class="last-name">${lastName}</p>
            <p class="subject-title">Specialist :<span class="group">${field}</span></>
            <p >Work situation:<span>${isWork?'work':'unemployment'}</span></p>
            <p class="phone-title">Phone:<span class="phone-number">${phoneNumber}</span></>
            <p class="email-title">Email:<a href="${email}" class="email">${email}</a></>
            <p class="rating-title">Rating:${rating}</p>
            <p class="degree-title">Degree:<span class="degree">${degree}</span></>
        </div>
        
    </div>
    `
}


async function getStudents(){
    studentsRow.innerHTML = "Loading...";

    try{

        const [filterField , order] = filter.split('-');
        
        const params = {firstName:search, page: activePage , limit:LIMIT ,sortBy:filterField , order , isMarried};
        
        let query = new URLSearchParams(params);
        
        history.pushState({} , "" , `index.html?${query}`);
        
        // const {data:students} = await axios.get(`${ENDPOINT}student` , {params})
        
        // const {data:allStudents} = await axios.get(`${ENDPOINT}student` , {params:{search}})
        
        const p1 = await axios.get( `${ENDPOINT}teacher/${studentId}/student`, { params } );

        const p2 = await axios.get( `${ENDPOINT}teacher/${studentId}/student`, { params: { search, isMarried } } );
    
        console.log(p1);
        console.log(p2);

        let students, allStudents;

        [ { data: students }, { data: allStudents } ] = await Promise.all( [ p1, p2 ] );

        console.log(students);

        const pages = Math.ceil(allStudents.length/LIMIT);

        if(pages > 1){
            pagination.innerHTML = `<li class="page-item ${activePage === 1 ? 'disabled' : ''}"><button class="page-link">Previous</button></li>`

            for ( let i = 1; i <= pages; i++ ) {
            pagination.innerHTML += `<li class="page-item ${i === activePage ? 'active' : ''}"><button class="page-link">${i}</button></li>`
            }

            pagination.innerHTML += `<li class="page-item ${activePage === pages ? 'disabled' : ''}"><button class="page-link">Next</button></li>`

            const paginationItems = document.querySelectorAll( '.page-link' );

            paginationItems.forEach( ( item, i ) => {
                if ( i === 0 ) {
                    item.addEventListener( 'click', () => { getPage( '-' ) } )
                } else if ( i === paginationItems.length - 1 ) {
                    item.addEventListener( 'click', () => { getPage( '+' ) } )
                } else {
                    item.addEventListener( 'click', () => { getPage( i ) } )
                }
            } );

            function getPage( i ) {
                if ( i === '+' ) {
                  activePage++;
                } else if ( i === '-' ) {
                  activePage--;
                } else {
                  activePage = i;
                }
                getStudents();
              }
        }else{
            pagination.innerHTML="";
        }

        studentsRow.innerHTML = "";
        
        students.map((student)=>{
            studentsRow.innerHTML += getStudentRow(student)
        });


        const editStudentBtns = document.querySelector('.edit-student-btn')
        const deleteStudentBtns = document.querySelector('.delete-student-btn')

        editStudentBtns.forEach((editBtn) => {
            editBtn.addEventListener('click' , async function(){
                selected = this.getAttribute('studentId');
                let {data:student} =  await axios.get(`${ENDPOINT}student/${selected}`)
                studentForm.elements.firstName.value = student.firstName;
                studentForm.elements.lastName.value = student.lastName;
                studentForm.elements.avatar.value = student.avatar;
                studentForm.elements.phoneNumber.value = student.phoneNumber;
                studentForm.elements.degree.value = student.degree;
                studentForm.elements.rating.value = student.rating;
                studentForm.elements.email.value = student.email;
                studentForm.elements.github.value = student.github;
                studentForm.elements.facebook.value = student.facebook;
                studentForm.elements.twitter.value = student.twitter;
                studentForm.elements.isWork.checked = student.isWork;
            })
        })

        deleteStudentBtns.forEach((deleteBtn) => {
            deleteBtn.addEventListener('click' , async function(){
                let check = window.confirm('Do yo want to delete this student?')
                if(check){
                    const studentId = this.getAttribute('studentId')
                    await axios.delete(`${ENDPOINT}student/${studentId}`)
                    getStudents();
                    activePage = 1;
                }
            })
        })

    }catch{
        studentsRow.innerHTML = err?.response?.data;
    }
}

studentForm.addEventListener('submit' , async function(e){
    e.preventDefault();
    if(this.checkValidity()){
        let student = {
            firstName: this.elements.firstName.value,
            lastName: this.elements.lastName.value,
            avatar:this.elements.avatar.value,
            isWork:this.elements.isWork.checked,
            degree:this.elements.degree.value,
            phoneNumber:this.elements.phoneNumber.value,
            rating:this.elements.rating.value,
            phoneNumber:this.elements.phoneNumber.value,
            email:this.elements.email.value,
            facebook:this.elements.facebook.value,
            twitter:this.elements.twitter.value,
            github:this.elements.github.value,
        }
        if(selected === null){
            await  axios.post(`${ENDPOINT}student` , student);
        }else{
            await axios.put(`${ENDPOINT}student/${selected}` , student );
        }
       getStudents();
        bootstrap.Modal.getInstance(studentModal).hide();
        this.reset();
    }else{
        this.classList.add('was-validated')
    }
    
    console.log(student);
})

getStudents();
