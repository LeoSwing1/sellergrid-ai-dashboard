// ================= SAFETY =================
window.onerror = function(msg){
    console.log("JS Error:", msg);
};


// ================= NAVIGATION =================
function toggleMenu(){
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");

    if(sidebar.classList.contains("active")){
        sidebar.classList.remove("active");
        main.classList.remove("shift");
    } else {
        sidebar.classList.add("active");
        main.classList.add("shift");
    }
}

function show(id){
    document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));

    const el = document.getElementById(id);
    if(el) el.classList.add("active");

    // auto close sidebar
    document.getElementById("sidebar").classList.remove("active");
    document.getElementById("main").classList.remove("shift");
}


// ================= CHART =================
let chart;

function createChart(dataVals){
    const canvas = document.getElementById("chart");
    if(!canvas) return;

    const ctx = canvas.getContext("2d");

    if(chart){
        chart.destroy();
    }

    const g1 = ctx.createLinearGradient(0,0,0,200);
    g1.addColorStop(0,"#22c55e");
    g1.addColorStop(1,"#16a34a");

    const g2 = ctx.createLinearGradient(0,0,0,200);
    g2.addColorStop(0,"#ef4444");
    g2.addColorStop(1,"#dc2626");

    const g3 = ctx.createLinearGradient(0,0,0,200);
    g3.addColorStop(0,"#3b82f6");
    g3.addColorStop(1,"#2563eb");

    chart = new Chart(ctx,{
        type:'doughnut',
        data:{
            labels:['Positive','Negative','Neutral'],
            datasets:[{
                data:dataVals,
                backgroundColor:[g1,g2,g3],
                borderWidth:0,
                hoverOffset:10
            }]
        },
        options:{
            cutout:"70%",
            plugins:{
                legend:{display:false}
            },
            animation:{
                duration:800
            }
        }
    });
}


// ================= DATA =================
const names = ["Rahul","Amit","Priya","Sneha","Karan"];
const platformsList = ["Amazon","Flipkart"];
const texts = ["Great product","Bad quality","Average","Fast delivery","Packaging issue"];

let data = [];

for(let i=0;i<100;i++){
    data.push({
        name: names[Math.floor(Math.random()*names.length)],
        email: "user"+i+"@gmail.com",
        platform: platformsList[Math.floor(Math.random()*2)],
        rating: Math.ceil(Math.random()*5),
        text: texts[Math.floor(Math.random()*texts.length)]
    });
}


// ================= STATE =================
let sentimentFilter = "all";
let currentPage = 1;
let perPage = 20;


// ================= FILTER =================
function filtered(){
    const platformEl = document.getElementById("platform");
    const ratingEl = document.getElementById("rating");
    const searchEl = document.getElementById("search");

    const platform = platformEl ? platformEl.value : "all";
    const rating = ratingEl ? ratingEl.value : "all";
    const search = searchEl ? searchEl.value.toLowerCase() : "";

    return data.filter(x=>{
        if(platform!="all" && x.platform!=platform) return false;
        if(rating!="all" && x.rating!=rating) return false;
        if(!x.text.toLowerCase().includes(search)) return false;

        if(sentimentFilter==="positive" && x.rating < 4) return false;
        if(sentimentFilter==="negative" && x.rating > 2) return false;

        return true;
    });
}


// ================= RENDER =================
function render(){

    const reviewList = document.getElementById("reviewList");
    const countText = document.getElementById("countText");

    if(reviewList) reviewList.innerHTML = "";

    let list = filtered();

    let total = list.length;
    let pos = list.filter(x=>x.rating>=4).length;
    let neg = list.filter(x=>x.rating<=2).length;
    let neutral = total - pos - neg;

    if(countText){
        countText.innerText = `Showing ${total} reviews | 👍 ${pos} | 👎 ${neg}`;
    }

    // update chart
    createChart([pos,neg,neutral]);

    // safe insights update
    const posEl = document.getElementById("posText");
    const negEl = document.getElementById("negText");
    const neuEl = document.getElementById("neuText");
    const totalEl = document.getElementById("totalText");

    if(posEl && negEl && neuEl && totalEl){
        posEl.innerText = `👍 Positive: ${pos}`;
        negEl.innerText = `👎 Negative: ${neg}`;
        neuEl.innerText = `😐 Neutral: ${neutral}`;
        totalEl.innerText = `📊 Total: ${total}`;
    }

    // pagination
    let end = currentPage * perPage;
    let pageData = list.slice(0,end);

    if(reviewList){
        pageData.forEach(x=>{
            let div = document.createElement("div");

            div.className = "review " + (x.rating>=4 ? "positive" : x.rating<=2 ? "negative" : "");

            div.innerHTML = `
                <b>${x.name}</b> (${x.email})<br>
                ⭐${x.rating} ${x.platform}<br>
                ${x.text}
            `;

            reviewList.appendChild(div);
        });
    }
}


// ================= ACTIONS =================
function setFilter(type){
    sentimentFilter = type;
    reset();
}

function nextPage(){
    currentPage++;
    render();
}

function prevPage(){
    if(currentPage > 1){
        currentPage--;
        render();
    }
}

function loadMore(){
    perPage += 20;
    render();
}

function reset(){
    currentPage = 1;
    perPage = 20;
    render();
}


// ================= CSV =================
function downloadCSV(){
    let csv = "Name,Email,Platform,Rating,Review\n";

    filtered().forEach(x=>{
        csv += `${x.name},${x.email},${x.platform},${x.rating},${x.text}\n`;
    });

    let blob = new Blob([csv], {type:"text/csv"});
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "reviews.csv";
    a.click();
}


// ================= HEADER SEARCH =================
const headerSearch = document.getElementById("headerSearch");
if(headerSearch){
    headerSearch.oninput = function(){
        const searchEl = document.getElementById("search");
        if(searchEl){
            searchEl.value = this.value;
            reset();
        }
    };
}


// ================= TAG FILTERS =================
function applyTag(tag){
    const platformEl = document.getElementById("platform");

    if(tag==="Amazon" || tag==="Flipkart"){
        if(platformEl) platformEl.value = tag;
    }

    if(tag==="positive") sentimentFilter="positive";
    if(tag==="negative") sentimentFilter="negative";

    reset();
}

function clearTags(){
    const platformEl = document.getElementById("platform");
    const ratingEl = document.getElementById("rating");
    const searchEl = document.getElementById("search");

    if(platformEl) platformEl.value="all";
    if(ratingEl) ratingEl.value="all";
    if(searchEl) searchEl.value="";

    sentimentFilter="all";

    reset();
}


// ================= AI =================
function reply(){
    const out = document.getElementById("output");
    if(out){
        out.innerText = "Thank you for your feedback. We will improve our service.";
    }
}


// ================= EVENTS =================
const platformEl = document.getElementById("platform");
const ratingEl = document.getElementById("rating");
const searchEl = document.getElementById("search");

if(platformEl) platformEl.onchange = reset;
if(ratingEl) ratingEl.onchange = reset;
if(searchEl) searchEl.oninput = reset;


// ================= INIT =================
render();