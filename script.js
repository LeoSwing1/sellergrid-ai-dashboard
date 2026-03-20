// ================= SAFETY =================
window.onerror = function(msg){
    console.log("JS Error:", msg);
};


// ================= LOADER =================
document.addEventListener("DOMContentLoaded", function () {
    const loader = document.getElementById("loader");

    setTimeout(() => {
        if(loader){
            loader.style.opacity = "0";
            setTimeout(() => loader.style.display = "none", 300);
        }
    }, 500);
});


// ================= NAVIGATION =================
function toggleMenu(){
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");

    if(!sidebar || !main) return;

    sidebar.classList.toggle("active");

    if(sidebar.classList.contains("active")){
        main.style.marginLeft = "240px";
    } else {
        main.style.marginLeft = "0";
    }
}

function show(id){
    document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));

    const el = document.getElementById(id);
    if(el) el.classList.add("active");

    document.getElementById("sidebar").classList.remove("active");
    document.getElementById("main").style.marginLeft = "0";
}


// ================= CHART =================
let chart;

function createChart(dataVals){
    const ctx = document.getElementById("chart")?.getContext("2d");
    if(!ctx) return;

    if(chart) chart.destroy();

    chart = new Chart(ctx,{
        type:'doughnut',
        data:{
            labels:['Positive','Negative','Neutral'],
            datasets:[{
                data:dataVals,
                backgroundColor:["#22c55e","#ef4444","#3b82f6"],
                borderWidth:0
            }]
        },
        options:{
            cutout:"70%",
            plugins:{ legend:{display:false} }
        }
    });
}


// ================= TREND GRAPH =================
let trendChart;

function createTrendChart(){

    const ctx = document.getElementById("trendChart")?.getContext("2d");
    if(!ctx) return;

    if(trendChart) trendChart.destroy();

    let weekly = [12,19,8,15,22,18,25];

    trendChart = new Chart(ctx,{
        type:'line',
        data:{
            labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
            datasets:[{
                data:weekly,
                borderColor:"#3b82f6",
                tension:0.4,
                fill:true,
                backgroundColor:"rgba(59,130,246,0.1)"
            }]
        },
        options:{
            plugins:{legend:{display:false}},
            scales:{x:{display:false},y:{display:false}}
        }
    });

    // 🔥 DETAILS
    let total = weekly.reduce((a,b)=>a+b,0);
    let growth = ((weekly[6]-weekly[0]) / weekly[0] * 100).toFixed(1);

    document.getElementById("trendTotal").innerText = total;
    document.getElementById("trendGrowth").innerText = growth + "%";

    // random split (demo)
    let pos = Math.floor(total * 0.7);
    let neg = total - pos;

    document.getElementById("trendPos").style.width = (pos/total*100) + "%";
    document.getElementById("trendNeg").style.width = (neg/total*100) + "%";
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
    const platform = document.getElementById("platform")?.value || "all";
    const rating = document.getElementById("rating")?.value || "all";
    const search = document.getElementById("search")?.value.toLowerCase() || "";

    return data.filter(x=>{
        if(platform!="all" && x.platform!=platform) return false;
        if(rating!="all" && x.rating!=rating) return false;
        if(!x.text.toLowerCase().includes(search)) return false;

        if(sentimentFilter==="positive" && x.rating < 4) return false;
        if(sentimentFilter==="negative" && x.rating > 2) return false;

        return true;
    });
}


// ================= ALERT =================
function checkAlert(pos, neg){
    const alertBox = document.getElementById("alertBox");
    if(!alertBox) return;

    alertBox.style.display = neg > pos ? "block" : "none";
}


// ================= MODAL =================
function openModal(data){
    const modal = document.getElementById("modal");
    const body = document.getElementById("modalBody");

    body.innerHTML = `
        <h3>${data.name}</h3>
        <p>${data.email}</p>
        <p>${data.platform}</p>
        <p>⭐ ${data.rating}</p>
        <p>${data.text}</p>
    `;

    modal.style.display = "flex";
}

function closeModal(){
    document.getElementById("modal").style.display = "none";
}


// ================= RENDER =================
function render(){

    const reviewList = document.getElementById("reviewList");
    const countText = document.getElementById("countText");

    if(!reviewList) return;

    reviewList.innerHTML = "";

    let list = filtered();

    let total = list.length;
    let pos = list.filter(x=>x.rating>=4).length;
    let neg = list.filter(x=>x.rating<=2).length;
    let neutral = total - pos - neg;

    if(countText){
        countText.innerText = `Showing ${total} reviews | 👍 ${pos} | 👎 ${neg}`;
    }

    createChart([pos,neg,neutral]);
    createTrendChart();
    checkAlert(pos,neg);

    // insights
    if(document.getElementById("posText")){
        posText.innerText = `👍 Positive: ${pos}`;
        negText.innerText = `👎 Negative: ${neg}`;
        neuText.innerText = `😐 Neutral: ${neutral}`;
        totalText.innerText = `📊 Total: ${total}`;
    }

    let end = currentPage * perPage;
    let pageData = list.slice(0,end);

    pageData.forEach(x=>{
        let div = document.createElement("div");

        div.className = "review " + (x.rating>=4 ? "positive" : x.rating<=2 ? "negative" : "");

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <b>${x.name}</b>
                <span style="font-size:12px;">${x.platform}</span>
            </div>
            <div style="font-size:12px; opacity:0.6;">${x.email}</div>
            ⭐ ${x.rating}
            <p>${x.text}</p>
        `;

        div.onclick = () => openModal(x);

        reviewList.appendChild(div);
    });
}


// ================= ACTIONS =================
function setFilter(type){
    sentimentFilter = type;
    reset();
}

function nextPage(){ currentPage++; render(); }
function prevPage(){ if(currentPage>1){ currentPage--; render(); } }
function loadMore(){ perPage+=20; render(); }

function reset(){
    currentPage = 1;
    perPage = 20;
    render();
}


// ================= EXPORT FLOW =================
function goToExport(){
    show("reviews");

    const section = document.getElementById("reviews");

    section.style.boxShadow = "0 0 20px rgba(59,130,246,0.6)";
    setTimeout(()=> section.style.boxShadow = "none",1500);

    window.scrollTo({ top: section.offsetTop - 20, behavior:"smooth" });
}


// ================= CSV =================
function downloadCSV(){
    let list = filtered();
    let csv = "Name,Email,Platform,Rating,Review\n";

    list.forEach(x=>{
        csv += `"${x.name}","${x.email}","${x.platform}",${x.rating},"${x.text}"\n`;
    });

    let blob = new Blob([csv]);
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "reviews.csv";
    a.click();
}


// ================= HEADER SEARCH =================
document.getElementById("headerSearch")?.addEventListener("input", function(){
    const searchEl = document.getElementById("search");
    if(searchEl){
        searchEl.value = this.value;
        reset();
    }
});


// ================= TAG FILTER =================
function applyTag(tag){
    if(tag==="Amazon" || tag==="Flipkart"){
        document.getElementById("platform").value = tag;
    }

    if(tag==="positive") sentimentFilter="positive";
    if(tag==="negative") sentimentFilter="negative";

    reset();
}


// ================= AI =================
function reply(){
    document.getElementById("output").innerText =
        "Thank you for your feedback. We will improve our service.";
}


// ================= EVENTS =================
document.getElementById("platform")?.addEventListener("change", reset);
document.getElementById("rating")?.addEventListener("change", reset);
document.getElementById("search")?.addEventListener("input", reset);


// ================= INIT =================
render();


// ================= KPI ANIMATION =================
window.addEventListener("load", () => {
    document.querySelectorAll(".kpi h2").forEach(el=>{
        let final = parseInt(el.innerText.replace(/,/g,"")) || 100;
        let count = 0;

        let interval = setInterval(()=>{
            count += Math.ceil(final/20);
            if(count >= final){
                count = final;
                clearInterval(interval);
            }
            el.innerText = count;
        }, 30);
    });
});