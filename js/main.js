import { ENDPOINT , LIMIT } from "./const.js";
const teachersRow = document.querySelector(".teacher-cards");
const searchInput = document.querySelector(".search-input");
const filterSelect = document.querySelector(".teacher-select");
const pagination =document.querySelector(".pagination");
const marrySelect = document.querySelector(".marry-select");
const teacherForm = document.querySelector(".teacher-form");
const teacherModal = document.querySelector("#teacher");


let search = "";
let activePage = 1;
let filter = "";
let isMarried = '';
let selected = null;


function getTeacherRow({firstName , lastNmae , avatar , isMarried , id}){
    return `
    <div class="teacher-card">
        <img src=${avatar} alt="">
        <div class="teacher-card-info">
            <p class="first-name">${firstName}</p>
            <p class="last-name">${lastNmae}</p>
            <p >isMarried:<span>${isMarried?'Marriage':'Single'}</span></p>
            <a class="studenst-link" href="#">See students</a>
        </div>
        <div scope="col">
            <button class="btn btn-primary edit-teacher-btn" data-bs-toggle="modal" data-bs-target="#teacher" teacherId=${id}>Edit</button>
            <button class="btn btn-primary delete-teacher-btn teacherId=${id}">Delete</button>
        </div>
    </div>
    `
}

async function getTeachers(){
    teachersRow.innerHTML = "Loading...";

    try{

        const [filterField , order] = filter.split('-');
        
        const params = {firstName:search, page: activePage , limit:LIMIT ,sortBy:filterField , order , isMarried};
        
        let query = new URLSearchParams(params);
        
        history.pushState({} , "" , `index.html?${query}`);
        
        const {data:teachers} = await axios.get(`${ENDPOINT}teacher` , {params})
        
        const {data:allTeachers} = await axios.get(`${ENDPOINT}teacher` , {params:{search}})

        const pages = Math.ceil(allTeachers.length/LIMIT);

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
                getTeachers();
              }
        }else{
            pagination.innerHTML="";
        }

        teachersRow.innerHTML = "";
        
        teachers.map((teacher)=>{
            teachersRow.innerHTML += getTeacherRow(teacher)
        });


        const editTeacherBtns = document.querySelector('.edit-teacher-btn')
        const deleteTeacherBtns = document.querySelector('.delete-teacher-btn')

        editTeacherBtns.forEach((editBtn) => {
            editBtn.addEventListener('click' , async function(){})
        })

    }catch{
        teachersRow.innerHTML = err?.response?.data;
    }
    
}

getTeachers();



searchInput.addEventListener("keyup" , function() {
    search = this.value;
    getTeachers();
    addQuery();
})


filterSelect.addEventListener('change' , function() {
    filter = this.value;
    getTeachers();
})

marrySelect.addEventListener('change' , function() {
    if(this.value === "true"){
        isMarried = true;
    }else if(this.value = "false"){
        isMarried = false;
    }else{
        isMarried = "";
    }
    getTeachers();
});

teacherForm.addEventListener("submit" , async function(e){
    e.preventDefault();
    if(this.checkValidity()){
        let teacher = {
            firstName: this.elements.firstName.value,
            lastNmae: this.elements.lastName.value,
            avatar:this.elements.avatar.value,
            isMarried:this.elements.isMarried.checked
        }
       await  axios.post(`${ENDPOINT}teacher` , teacher);
       getTeachers();
        bootstrap.Modal.getInstance(teacherModal).hide();
        this.reset();
    }else{
        this.classList.add('was-validated')
    }
    
    console.log(teacher);
})




