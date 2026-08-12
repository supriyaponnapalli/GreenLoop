// ============================================================
// GREENLOOP DATABASE
// ============================================================

let users =
    JSON.parse(localStorage.getItem('gl_users')) || [];

let inventory =
    JSON.parse(localStorage.getItem('gl_inventory')) || [];

let householdWaste =
    JSON.parse(localStorage.getItem('gl_household_waste')) || [];

let currentUser = null;

let goalChartInstance = null;

let userVillageBarChartInstance = null;
let userVillagePieChartInstance = null;

let adminVillageBarChartInstance = null;
let adminVillagePieChartInstance = null;


// ============================================================
// GREENLOOP DATA WAREHOUSE
// ============================================================
//
// Star-schema style:
//
// DIM_USER
// DIM_HOUSEHOLD
// DIM_VILLAGE
// DIM_DATE
//
// FACT_HOUSEHOLD_WASTE
// FACT_INVENTORY
// FACT_ACTIVITY
//
// Everything is stored locally for this frontend prototype.
// ============================================================

let dataWarehouse =
    JSON.parse(
        localStorage.getItem('gl_datawarehouse')
    ) || {

        dimension_user: [],

        dimension_household: [],

        dimension_village: [],

        dimension_date: [],

        fact_household_waste: [],

        fact_inventory: [],

        fact_activity: []

    };


// ============================================================
// SAVE DATA
// ============================================================

function saveData() {

    localStorage.setItem(
        'gl_users',
        JSON.stringify(users)
    );

    localStorage.setItem(
        'gl_inventory',
        JSON.stringify(inventory)
    );

    localStorage.setItem(
        'gl_household_waste',
        JSON.stringify(householdWaste)
    );

    localStorage.setItem(
        'gl_datawarehouse',
        JSON.stringify(dataWarehouse)
    );

}


// ============================================================
// ID GENERATORS
// ============================================================

function generateId() {

    return 'LOT-' +
        Math.floor(Math.random() * 10000);

}


function generateHouseholdId() {

    return 'HH-' +
        Date.now() +
        '-' +
        Math.floor(Math.random() * 1000);

}


function generateWarehouseId(prefix) {

    return prefix +
        '-' +
        Date.now() +
        '-' +
        Math.floor(Math.random() * 1000);

}


// ============================================================
// UI / NAVIGATION
// ============================================================

function toggleAuth(view) {

    document
        .getElementById('login-box')
        .classList
        .toggle(
            'hidden',
            view === 'register'
        );


    document
        .getElementById('register-box')
        .classList
        .toggle(
            'hidden',
            view === 'login'
        );

}


function switchTab(tabId) {

    document
        .querySelectorAll('.view-section')
        .forEach(sec =>
            sec.classList.add('hidden')
        );


    const section =
        document.getElementById(tabId);


    if (!section) return;


    section.classList.remove('hidden');


    if (tabId === 'user-dashboard') {

        updateDashboardStats();

    }


    if (tabId === 'user-marketplace') {

        renderUserMarketplace();

    }


    if (tabId === 'admin-marketplace') {

        renderAdminMarketplace();

    }


    if (tabId === 'user-waste-calculation') {

        prepareWasteForm();

    }


    if (tabId === 'user-village-analysis') {

        renderUserVillageAnalysis();

    }


    if (tabId === 'admin-waste-calculation') {

        renderAdminWarehouse();

    }


    if (tabId === 'admin-village-analysis') {

        prepareAdminVillageAnalysis();

    }

}


// ============================================================
// AUTHENTICATION
// ============================================================

document
.getElementById('register-form')
.addEventListener(
    'submit',
    function(e) {

        e.preventDefault();


        const u =
            document
                .getElementById('reg-username')
                .value
                .trim();


        const l =
            document
                .getElementById('reg-location')
                .value
                .trim();


        const p =
            document
                .getElementById('reg-password')
                .value;


        const r =
            document
                .getElementById('reg-role')
                .value;


        if (
            users.find(
                user =>
                    user.username.toLowerCase() ===
                    u.toLowerCase()
            )
        ) {

            return alert(
                'Username taken!'
            );

        }


        users.push({

            username: u,

            location: l,

            password: p,

            role: r,

            gameScore: 0

        });


        saveData();


        syncDataWarehouse();


        alert(
            'Registered! Please login.'
        );


        this.reset();


        toggleAuth('login');

    }
);


document
.getElementById('login-form')
.addEventListener(
    'submit',
    function(e) {

        e.preventDefault();


        const u =
            document
                .getElementById('login-username')
                .value
                .trim();


        const p =
            document
                .getElementById('login-password')
                .value;


        const user =
            users.find(
                user =>
                    user.username === u &&
                    user.password === p
            );


        if (user) {

            currentUser = user;


            this.reset();


            setupEnvironment();

        }

        else {

            alert(
                'Invalid credentials.'
            );

        }

    }
);


// ============================================================
// LOGOUT
// ============================================================

function logout() {

    currentUser = null;


    document
        .getElementById('nav-links')
        .classList
        .add('hidden');


    document
        .getElementById('user-info')
        .classList
        .add('hidden');


    document
        .getElementById('auth-section')
        .classList
        .remove('hidden');


    document
        .querySelectorAll('.view-section')
        .forEach(
            sec =>
                sec.classList.add('hidden')
        );

}


// ============================================================
// SETUP ENVIRONMENT
// ============================================================

function setupEnvironment() {

    document
        .getElementById('auth-section')
        .classList
        .add('hidden');


    document
        .getElementById('nav-links')
        .classList
        .remove('hidden');


    document
        .getElementById('user-info')
        .classList
        .remove('hidden');


    document
        .getElementById('welcome-message')
        .innerText =
        `Hi, ${currentUser.username}`;


    syncDataWarehouse();


    if (currentUser.role === 'User') {

        document
            .getElementById('user-menu')
            .classList
            .remove('hidden');


        document
            .getElementById('admin-menu')
            .classList
            .add('hidden');


        switchTab(
            'user-dashboard'
        );


        initGame();


        renderDIY();

    }

    else {

        document
            .getElementById('user-menu')
            .classList
            .add('hidden');


        document
            .getElementById('admin-menu')
            .classList
            .remove('hidden');


        switchTab(
            'admin-marketplace'
        );

    }

}


// ============================================================
// LOCATION
// ============================================================

function editLocation() {

    let newLoc =
        prompt(
            'Enter your new city/location:',
            currentUser.location
        );


    if (
        newLoc &&
        newLoc.trim() !== ''
    ) {

        currentUser.location =
            newLoc.trim();


        let userIndex =
            users.findIndex(
                u =>
                    u.username ===
                    currentUser.username
            );


        users[userIndex].location =
            currentUser.location;


        saveData();


        syncDataWarehouse();


        updateDashboardStats();


        alert(
            'Location updated!'
        );

    }

}


// ============================================================
// USER DASHBOARD
// ============================================================

function updateDashboardStats() {

    const myLots =
        inventory.filter(
            l =>
                l.user ===
                currentUser.username
        );


    const totalListed =
        myLots.reduce(
            (sum, lot) =>
                sum + lot.weight,
            0
        );


    const totalRecycled =
        myLots
            .filter(
                l =>
                    l.status ===
                    'Claimed'
            )
            .reduce(
                (sum, lot) =>
                    sum + lot.weight,
                0
            );


    document
        .getElementById('stat-location')
        .innerText =
        currentUser.location;


    document
        .getElementById('stat-listed')
        .innerText =
        totalListed + ' kg';


    document
        .getElementById('stat-recycled')
        .innerText =
        totalRecycled + ' kg';


    document
        .getElementById('stat-score')
        .innerText =
        currentUser.gameScore || 0;


    const GOAL = 100;


    const progress =
        Math.min(
            totalRecycled,
            GOAL
        );


    const remaining =
        Math.max(
            GOAL - totalRecycled,
            0
        );


    const goalText =
        document.getElementById(
            'goal-text'
        );


    if (
        totalRecycled >= GOAL
    ) {

        goalText.innerText =
            `🎉 Goal Reached!`;

        goalText.style.color =
            'var(--primary-color)';

    }

    else {

        goalText.innerText =
            `${Math.floor(
                (totalRecycled / GOAL) * 100
            )}% of 100kg Goal`;

        goalText.style.color =
            'var(--text-main)';

    }


    renderDonutChart(
        progress,
        remaining
    );

}


// ============================================================
// EXISTING DONUT
// ============================================================

function renderDonutChart(
    progress,
    remaining
) {

    const canvas =
        document.getElementById(
            'goalChart'
        );


    if (!canvas) return;


    const ctx =
        canvas.getContext('2d');


    if (goalChartInstance) {

        goalChartInstance.destroy();

    }


    goalChartInstance =
        new Chart(
            ctx,
            {

                type: 'doughnut',

                data: {

                    labels: [
                        'Recycled',
                        'Remaining'
                    ],

                    datasets: [

                        {

                            data: [
                                progress,
                                remaining
                            ],

                            backgroundColor: [
                                '#10B981',
                                '#E5E7EB'
                            ],

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: '70%',

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );

}


// ============================================================
// LOCATION HASH
// ============================================================

function calculateDistance(
    locationString
) {

    let hash = 0;


    const str =
        locationString.toLowerCase();


    for (
        let i = 0;
        i < str.length;
        i++
    ) {

        hash =
            str.charCodeAt(i) +
            ((hash << 5) - hash);

    }


    return (
        Math.abs(hash) % 48
    ) + 2;

}


// ============================================================
// MARKETPLACE
// ============================================================

document
.getElementById('waste-form')
.addEventListener(
    'submit',
    function(e) {

        e.preventDefault();


        const accurateDistance =
            calculateDistance(
                currentUser.location
            );


        const newLot = {

            id: generateId(),

            user:
                currentUser.username,

            location:
                currentUser.location,

            distance:
                accurateDistance,

            type:
                document
                    .getElementById(
                        'plastic-type'
                    )
                    .value,

            weight:
                parseInt(
                    document
                        .getElementById(
                            'plastic-weight'
                        )
                        .value
                ),

            status:
                'Available',

            claimedBy:
                null

        };


        inventory.push(
            newLot
        );


        saveData();


        syncDataWarehouse();


        this.reset();


        renderUserMarketplace();


        updateDashboardStats();


        alert(
            'Waste listed for industries!'
        );

    }
);


function renderUserMarketplace() {

    const tbody =
        document.getElementById(
            'collector-tbody'
        );


    tbody.innerHTML = '';


    inventory
        .filter(
            l =>
                l.user ===
                currentUser.username
        )
        .forEach(
            lot => {

                let sc =
                    lot.status ===
                    'Available'
                        ? 'status-available'
                        : 'status-claimed';


                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${lot.id}
                        </td>

                        <td>
                            ${lot.type}
                        </td>

                        <td>
                            ${lot.weight} kg
                        </td>

                        <td class="${sc}">
                            ${lot.status}
                        </td>

                    </tr>

                `;

            }
        );

}


// ============================================================
// ADMIN MARKETPLACE
// ============================================================

function renderAdminMarketplace() {

    const availBody =
        document.getElementById(
            'industry-tbody'
        );


    const claimBody =
        document.getElementById(
            'claimed-tbody'
        );


    availBody.innerHTML = '';

    claimBody.innerHTML = '';


    const filterType =
        document.getElementById(
            'filter-type'
        ).value;


    const filterWeight =
        parseInt(
            document.getElementById(
                'filter-weight'
            ).value
        );


    const filterDist =
        parseInt(
            document.getElementById(
                'filter-distance'
            ).value
        );


    inventory.forEach(
        lot => {

            if (
                lot.status ===
                'Available'
            ) {

                if (
                    filterType !== 'All' &&
                    lot.type !== filterType
                )
                    return;


                if (
                    lot.weight <
                    filterWeight
                )
                    return;


                if (
                    lot.distance >
                    filterDist
                )
                    return;


                availBody.innerHTML += `

                    <tr>

                        <td>
                            ${lot.id}
                        </td>

                        <td>
                            ${lot.location}
                        </td>

                        <td>
                            ${lot.distance} km
                        </td>

                        <td>
                            ${lot.type}
                        </td>

                        <td>
                            ${lot.weight} kg
                        </td>

                        <td>

                            <button
                                class="btn btn-claim"
                                onclick="claimLot('${lot.id}')">

                                Buy

                            </button>

                        </td>

                    </tr>

                `;

            }

            else if (
                lot.claimedBy ===
                currentUser.username
            ) {

                claimBody.innerHTML += `

                    <tr>

                        <td>
                            ${lot.id}
                        </td>

                        <td>
                            ${lot.user}
                        </td>

                        <td>
                            ${lot.location}
                        </td>

                        <td>
                            ${lot.type}
                        </td>

                        <td>
                            ${lot.weight} kg
                        </td>

                    </tr>

                `;

            }

        }
    );

}


function claimLot(id) {

    if (
        confirm(
            'Accept request and dispatch pickup to this location?'
        )
    ) {

        let lot =
            inventory.find(
                l =>
                    l.id === id
            );


        if (!lot) return;


        lot.status =
            'Claimed';


        lot.claimedBy =
            currentUser.username;


        saveData();


        syncDataWarehouse();


        renderAdminMarketplace();

    }

}


// ============================================================
// HOUSEHOLD WASTE CALCULATION
// ============================================================

function prepareWasteForm() {

    if (!currentUser) return;


    const owner =
        document.getElementById(
            'waste-owner-name'
        );


    const village =
        document.getElementById(
            'waste-village'
        );


    if (owner && !owner.value) {

        owner.value =
            currentUser.username;

    }


    if (village && !village.value) {

        village.value =
            currentUser.location;

    }

}


// ============================================================
// SAVE HOUSEHOLD WASTE
// ============================================================

document
.getElementById(
    'waste-calculation-form'
)
.addEventListener(
    'submit',
    function(e) {

        e.preventDefault();


        const ownerName =
            document
                .getElementById(
                    'waste-owner-name'
                )
                .value
                .trim();


        const doorNumber =
            document
                .getElementById(
                    'waste-door-number'
                )
                .value
                .trim();


        const village =
            document
                .getElementById(
                    'waste-village'
                )
                .value
                .trim();


        const address =
            document
                .getElementById(
                    'waste-address'
                )
                .value
                .trim();


        const dailyWaste =
            parseFloat(
                document
                    .getElementById(
                        'daily-waste'
                    )
                    .value
            );


        const recyclableWaste =
            parseFloat(
                document
                    .getElementById(
                        'recyclable-waste'
                    )
                    .value
            );


        const reducibleWaste =
            parseFloat(
                document
                    .getElementById(
                        'reducible-waste'
                    )
                    .value
            );


        if (
            dailyWaste < 0 ||
            recyclableWaste < 0 ||
            reducibleWaste < 0
        ) {

            alert(
                'Waste values cannot be negative.'
            );

            return;

        }


        if (
            recyclableWaste >
            dailyWaste
        ) {

            alert(
                'Recyclable waste cannot exceed daily waste.'
            );

            return;

        }


        if (
            reducibleWaste >
            dailyWaste
        ) {

            alert(
                'Reducible waste cannot exceed daily waste.'
            );

            return;

        }


        if (
            recyclableWaste +
            reducibleWaste >
            dailyWaste
        ) {

            alert(
                'Recyclable + reducible waste cannot exceed total daily waste.'
            );

            return;

        }


        const monthlyWaste =
            dailyWaste * 30;


        const monthlyRecyclable =
            recyclableWaste * 30;


        const monthlyReducible =
            reducibleWaste * 30;


        const recyclablePercentage =
            dailyWaste === 0
                ? 0
                :
                (
                    recyclableWaste /
                    dailyWaste
                ) * 100;


        const reductionPercentage =
            dailyWaste === 0
                ? 0
                :
                (
                    reducibleWaste /
                    dailyWaste
                ) * 100;


        const remainingDailyWaste =
            Math.max(
                dailyWaste -
                recyclableWaste -
                reducibleWaste,
                0
            );


        const monthlyRemainingWaste =
            remainingDailyWaste * 30;


        const record = {

            id:
                generateHouseholdId(),

            user:
                currentUser.username,

            ownerName,

            doorNumber,

            village,

            address,

            dailyWaste,

            recyclableWaste,

            reducibleWaste,

            monthlyWaste,

            monthlyRecyclable,

            monthlyReducible,

            recyclablePercentage,

            reductionPercentage,

            remainingDailyWaste,

            monthlyRemainingWaste,

            date:
                new Date().toISOString()

        };


        householdWaste.push(
            record
        );


        saveData();


        syncDataWarehouse();


        document
            .getElementById(
                'result-monthly-waste'
            )
            .innerText =
            monthlyWaste.toFixed(2) +
            ' kg';


        document
            .getElementById(
                'result-recyclable-percentage'
            )
            .innerText =
            recyclablePercentage.toFixed(1) +
            '%';


        document
            .getElementById(
                'result-reduction-percentage'
            )
            .innerText =
            reductionPercentage.toFixed(1) +
            '%';


        document
            .getElementById(
                'result-remaining-waste'
            )
            .innerText =
            monthlyRemainingWaste.toFixed(2) +
            ' kg';


        document
            .getElementById(
                'waste-result'
            )
            .classList
            .remove('hidden');


        alert(
            'Household data saved to GreenLoop Data Warehouse!'
        );

    }
);


// ============================================================
// VILLAGE CALCULATION
// ============================================================

function getVillageRecords(
    village
) {

    if (
        village === 'All'
    ) {

        return householdWaste;

    }


    return householdWaste.filter(
        record =>
            record.village
                .toLowerCase()
                .trim() ===
            village
                .toLowerCase()
                .trim()
    );

}


function calculateVillageTotals(
    records
) {

    const totalHouseholds =
        records.length;


    const totalWaste =
        records.reduce(
            (sum, record) =>
                sum +
                record.monthlyWaste,
            0
        );


    const totalRecyclable =
        records.reduce(
            (sum, record) =>
                sum +
                record.monthlyRecyclable,
            0
        );


    const totalReducible =
        records.reduce(
            (sum, record) =>
                sum +
                record.monthlyReducible,
            0
        );


    const totalRemaining =
        records.reduce(
            (sum, record) =>
                sum +
                record.monthlyRemainingWaste,
            0
        );


    const reductionPercentage =
        totalWaste === 0
            ? 0
            :
            (
                totalReducible /
                totalWaste
            ) * 100;


    return {

        totalHouseholds,

        totalWaste,

        totalRecyclable,

        totalReducible,

        totalRemaining,

        reductionPercentage

    };

}


// ============================================================
// USER VILLAGE ANALYSIS
// ============================================================

function renderUserVillageAnalysis() {

    if (!currentUser) return;


    const village =
        currentUser.location;


    const records =
        getVillageRecords(
            village
        );


    const totals =
        calculateVillageTotals(
            records
        );


    document
        .getElementById(
            'user-village-name'
        )
        .innerText =
        `Overall analysis for ${village}`;


    document
        .getElementById(
            'user-analysis-households'
        )
        .innerText =
        totals.totalHouseholds;


    document
        .getElementById(
            'user-analysis-total-waste'
        )
        .innerText =
        totals.totalWaste.toFixed(2) +
        ' kg';


    document
        .getElementById(
            'user-analysis-recyclable'
        )
        .innerText =
        totals.totalRecyclable.toFixed(2) +
        ' kg';


    document
        .getElementById(
            'user-analysis-reducible'
        )
        .innerText =
        totals.totalReducible.toFixed(2) +
        ' kg';


    document
        .getElementById(
            'user-analysis-remaining'
        )
        .innerText =
        totals.totalRemaining.toFixed(2) +
        ' kg';


    document
        .getElementById(
            'user-analysis-reduction'
        )
        .innerText =
        totals.reductionPercentage.toFixed(1) +
        '%';


    renderUserVillageCharts(
        totals
    );

}


// ============================================================
// USER VILLAGE CHARTS
// ============================================================

function renderUserVillageCharts(
    totals
) {

    const barCanvas =
        document.getElementById(
            'userVillageBarChart'
        );


    const pieCanvas =
        document.getElementById(
            'userVillagePieChart'
        );


    if (!barCanvas || !pieCanvas)
        return;


    if (
        userVillageBarChartInstance
    ) {

        userVillageBarChartInstance.destroy();

    }


    if (
        userVillagePieChartInstance
    ) {

        userVillagePieChartInstance.destroy();

    }


    userVillageBarChartInstance =
        new Chart(
            barCanvas.getContext('2d'),
            {

                type: 'bar',

                data: {

                    labels: [
                        'Recyclable',
                        'Reducible',
                        'Remaining'
                    ],

                    datasets: [

                        {

                            label:
                                'Monthly Waste (kg)',

                            data: [

                                totals.totalRecyclable,

                                totals.totalReducible,

                                totals.totalRemaining

                            ],

                            backgroundColor: [

                                '#10B981',

                                '#F59E0B',

                                '#6B7280'

                            ],

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }
        );


    userVillagePieChartInstance =
        new Chart(
            pieCanvas.getContext('2d'),
            {

                type: 'doughnut',

                data: {

                    labels: [

                        'Recyclable',

                        'Reducible',

                        'Remaining'

                    ],

                    datasets: [

                        {

                            data: [

                                totals.totalRecyclable,

                                totals.totalReducible,

                                totals.totalRemaining

                            ],

                            backgroundColor: [

                                '#10B981',

                                '#F59E0B',

                                '#6B7280'

                            ],

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: '65%',

                    plugins: {

                        legend: {

                            position: 'bottom'

                        }

                    }

                }

            }
        );

}


// ============================================================
// GET ALL VILLAGES
// ============================================================

function getAllVillages() {

    const villages =
        householdWaste
            .map(
                record =>
                    record.village
            )
            .filter(Boolean);


    return [
        ...new Set(
            villages
        )
    ].sort();

}


// ============================================================
// ADMIN WASTE RECORDS
// ============================================================

function populateAdminVillageFilter() {

    const select =
        document.getElementById(
            'admin-household-village-filter'
        );


    if (!select) return;


    const currentValue =
        select.value;


    select.innerHTML =
        `
        <option value="All">
            All Villages
        </option>
        `;


    getAllVillages()
        .forEach(
            village => {

                select.innerHTML += `

                    <option
                        value="${village}">

                        ${village}

                    </option>

                `;

            }
        );


    if (
        getAllVillages()
            .includes(currentValue)
    ) {

        select.value =
            currentValue;

    }

}


function renderAdminHouseholdRecords() {

    const tbody =
        document.getElementById(
            'admin-household-tbody'
        );


    if (!tbody) return;


    const filter =
        document.getElementById(
            'admin-household-village-filter'
        ).value;


    const records =
        getVillageRecords(
            filter
        );


    tbody.innerHTML = '';


    records.forEach(
        record => {

            tbody.innerHTML += `

                <tr>

                    <td>
                        ${record.ownerName}
                    </td>

                    <td>
                        ${record.doorNumber}
                    </td>

                    <td>
                        ${record.village}
                    </td>

                    <td>
                        ${record.address}
                    </td>

                    <td>
                        ${record.dailyWaste.toFixed(2)} kg
                    </td>

                    <td>
                        ${record.monthlyWaste.toFixed(2)} kg
                    </td>

                    <td>
                        ${record.monthlyRecyclable.toFixed(2)} kg
                    </td>

                    <td>
                        ${record.monthlyReducible.toFixed(2)} kg
                    </td>

                    <td>
                        ${record.monthlyRemainingWaste.toFixed(2)} kg
                    </td>

                    <td>
                        ${record.recyclablePercentage.toFixed(1)}%
                    </td>

                    <td>
                        ${record.reductionPercentage.toFixed(1)}%
                    </td>

                </tr>

            `;

        }
    );

}


// ============================================================
// ADMIN WAREHOUSE
// ============================================================

function renderAdminWarehouse() {

    syncDataWarehouse();


    populateAdminVillageFilter();


    renderAdminHouseholdRecords();


    document
        .getElementById(
            'warehouse-households'
        )
        .innerText =
        dataWarehouse
            .dimension_household
            .length;


    document
        .getElementById(
            'warehouse-villages'
        )
        .innerText =
        dataWarehouse
            .dimension_village
            .length;


    document
        .getElementById(
            'warehouse-waste-records'
        )
        .innerText =
        dataWarehouse
            .fact_household_waste
            .length;


    document
        .getElementById(
            'warehouse-inventory-records'
        )
        .innerText =
        dataWarehouse
            .fact_inventory
            .length;

}


// ============================================================
// ADMIN VILLAGE FILTER
// ============================================================

function prepareAdminVillageAnalysis() {

    const select =
        document.getElementById(
            'admin-analysis-village'
        );


    if (!select) return;


    const currentValue =
        select.value;


    select.innerHTML =
        `
        <option value="All">
            All Villages
        </option>
        `;


    getAllVillages()
        .forEach(
            village => {

                select.innerHTML += `

                    <option
                        value="${village}">

                        ${village}

                    </option>

                `;

            }
        );


    if (
        getAllVillages()
            .includes(currentValue)
    ) {

        select.value =
            currentValue;

    }


    renderAdminVillageAnalysis();

}


// ============================================================
// ADMIN VILLAGE ANALYSIS
// ============================================================

function renderAdminVillageAnalysis() {

    const select =
        document.getElementById(
            'admin-analysis-village'
        );


    if (!select) return;


    const village =
        select.value;


    const records =
        getVillageRecords(
            village
        );


    const totals =
        calculateVillageTotals(
            records
        );


    document
        .getElementById(
            'admin-analysis-households'
        )
        .innerText =
        totals.totalHouseholds;


    document
        .getElementById(
            'admin-analysis-total-waste'
        )
        .innerText =
        totals.totalWaste.toFixed(2) +
        ' kg';


    document
        .getElementById(
            'admin-analysis-recyclable'
        )
        .innerText =
        totals.totalRecyclable.toFixed(2) +
        ' kg';


    document
        .getElementById(
            'admin-analysis-reducible'
        )
        .innerText =
        totals.totalReducible.toFixed(2) +
        ' kg';


    document
        .getElementById(
            'admin-analysis-remaining'
        )
        .innerText =
        totals.totalRemaining.toFixed(2) +
        ' kg';


    document
        .getElementById(
            'admin-analysis-reduction'
        )
        .innerText =
        totals.reductionPercentage.toFixed(1) +
        '%';


    renderAdminVillageCharts(
        totals
    );

}


// ============================================================
// ADMIN CHARTS
// ============================================================

function renderAdminVillageCharts(
    totals
) {

    const barCanvas =
        document.getElementById(
            'adminVillageBarChart'
        );


    const pieCanvas =
        document.getElementById(
            'adminVillagePieChart'
        );


    if (!barCanvas || !pieCanvas)
        return;


    if (
        adminVillageBarChartInstance
    ) {

        adminVillageBarChartInstance.destroy();

    }


    if (
        adminVillagePieChartInstance
    ) {

        adminVillagePieChartInstance.destroy();

    }


    adminVillageBarChartInstance =
        new Chart(
            barCanvas.getContext('2d'),
            {

                type: 'bar',

                data: {

                    labels: [

                        'Recyclable',

                        'Reducible',

                        'Remaining'

                    ],

                    datasets: [

                        {

                            label:
                                'Monthly Waste (kg)',

                            data: [

                                totals.totalRecyclable,

                                totals.totalReducible,

                                totals.totalRemaining

                            ],

                            backgroundColor: [

                                '#10B981',

                                '#F59E0B',

                                '#6B7280'

                            ],

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }
        );


    adminVillagePieChartInstance =
        new Chart(
            pieCanvas.getContext('2d'),
            {

                type: 'doughnut',

                data: {

                    labels: [

                        'Recyclable',

                        'Reducible',

                        'Remaining'

                    ],

                    datasets: [

                        {

                            data: [

                                totals.totalRecyclable,

                                totals.totalReducible,

                                totals.totalRemaining

                            ],

                            backgroundColor: [

                                '#10B981',

                                '#F59E0B',

                                '#6B7280'

                            ],

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: '65%',

                    plugins: {

                        legend: {

                            position: 'bottom'

                        }

                    }

                }

            }
        );

}


// ============================================================
// DATA WAREHOUSE ETL
// ============================================================
//
// This converts application data into warehouse dimensions
// and facts.
//
// It runs whenever important application data changes.
// ============================================================

function syncDataWarehouse() {

    // ------------------------------------------
    // DIM USER
    // ------------------------------------------

    dataWarehouse.dimension_user =
        users.map(
            user => ({

                userKey:
                    'USER-' +
                    user.username,

                username:
                    user.username,

                location:
                    user.location,

                role:
                    user.role,

                gameScore:
                    user.gameScore || 0

            })
        );


    // ------------------------------------------
    // DIM VILLAGE
    // ------------------------------------------

    const villageNames =
        [
            ...new Set(

                householdWaste
                    .map(
                        record =>
                            record.village
                    )
                    .filter(Boolean)

            )
        ];


    dataWarehouse.dimension_village =
        villageNames.map(
            (village, index) => ({

                villageKey:
                    'VILLAGE-' +
                    (index + 1),

                villageName:
                    village

            })
        );


    // ------------------------------------------
    // DIM HOUSEHOLD
    // ------------------------------------------

    dataWarehouse.dimension_household =
        householdWaste.map(
            record => ({

                householdKey:
                    record.id,

                ownerName:
                    record.ownerName,

                doorNumber:
                    record.doorNumber,

                village:
                    record.village,

                address:
                    record.address,

                user:
                    record.user

            })
        );


    // ------------------------------------------
    // DIM DATE
    // ------------------------------------------

    const dates =
        [
            ...new Set(

                householdWaste
                    .map(
                        record =>
                            record.date
                                ?.split('T')[0]
                    )
                    .filter(Boolean)

            )
        ];


    dataWarehouse.dimension_date =
        dates.map(
            date => {

                const d =
                    new Date(date);


                return {

                    dateKey:
                        date,

                    day:
                        d.getDate(),

                    month:
                        d.getMonth() + 1,

                    year:
                        d.getFullYear(),

                    quarter:
                        Math.ceil(
                            (d.getMonth() + 1) /
                            3
                        )

                };

            }
        );


    // ------------------------------------------
    // FACT HOUSEHOLD WASTE
    // ------------------------------------------

    dataWarehouse.fact_household_waste =
        householdWaste.map(
            record => ({

                wasteFactKey:
                    'WF-' +
                    record.id,

                householdKey:
                    record.id,

                villageKey:
                    findVillageKey(
                        record.village
                    ),

                dateKey:
                    record.date
                        ?.split('T')[0],

                dailyWaste:
                    record.dailyWaste,

                monthlyWaste:
                    record.monthlyWaste,

                recyclableWaste:
                    record.monthlyRecyclable,

                reducibleWaste:
                    record.monthlyReducible,

                remainingWaste:
                    record.monthlyRemainingWaste,

                recyclablePercentage:
                    record.recyclablePercentage,

                reductionPercentage:
                    record.reductionPercentage

            })
        );


    // ------------------------------------------
    // FACT INVENTORY
    // ------------------------------------------

    dataWarehouse.fact_inventory =
        inventory.map(
            lot => ({

                inventoryFactKey:
                    'IF-' +
                    lot.id,

                lotId:
                    lot.id,

                user:
                    lot.user,

                location:
                    lot.location,

                material:
                    lot.type,

                weight:
                    lot.weight,

                distance:
                    lot.distance,

                status:
                    lot.status,

                claimedBy:
                    lot.claimedBy

            })
        );


    // ------------------------------------------
    // FACT ACTIVITY
    // ------------------------------------------

    dataWarehouse.fact_activity =
        users.map(
            user => ({

                activityKey:
                    'ACT-' +
                    user.username,

                username:
                    user.username,

                location:
                    user.location,

                gameScore:
                    user.gameScore || 0,

                listedLots:
                    inventory.filter(
                        lot =>
                            lot.user ===
                            user.username
                    ).length

            })
        );


    localStorage.setItem(
        'gl_datawarehouse',
        JSON.stringify(
            dataWarehouse
        )
    );

}


// ============================================================
// FIND VILLAGE KEY
// ============================================================

function findVillageKey(
    villageName
) {

    const village =
        dataWarehouse
            .dimension_village
            .find(
                v =>
                    v.villageName
                        .toLowerCase() ===
                    villageName
                        .toLowerCase()
            );


    return village
        ? village.villageKey
        : null;

}


// ============================================================
// SAMPLE VILLAGE DATA
// ============================================================
//
// This creates demonstration households only once.
//
// Users can later add real household data.
// ============================================================

function createSampleVillageData() {

    if (
        localStorage.getItem(
            'gl_sample_data_created'
        )
    ) {

        return;

    }


    const sampleRecords = [

        {
            ownerName: 'Ravi Kumar',
            doorNumber: '1-101',
            village: 'Green Valley',
            address: 'Main Road',
            dailyWaste: 2.5,
            recyclableWaste: 0.8,
            reducibleWaste: 0.5
        },

        {
            ownerName: 'Lakshmi Devi',
            doorNumber: '1-102',
            village: 'Green Valley',
            address: 'Temple Street',
            dailyWaste: 3.0,
            recyclableWaste: 1.0,
            reducibleWaste: 0.7
        },

        {
            ownerName: 'Suresh Rao',
            doorNumber: '1-103',
            village: 'Green Valley',
            address: 'School Road',
            dailyWaste: 2.2,
            recyclableWaste: 0.6,
            reducibleWaste: 0.4
        },

        {
            ownerName: 'Anitha',
            doorNumber: '1-104',
            village: 'Green Valley',
            address: 'Lake Road',
            dailyWaste: 1.8,
            recyclableWaste: 0.5,
            reducibleWaste: 0.3
        },


        {
            ownerName: 'Mahesh',
            doorNumber: '2-201',
            village: 'Eco Nagar',
            address: 'Market Road',
            dailyWaste: 2.8,
            recyclableWaste: 0.9,
            reducibleWaste: 0.6
        },

        {
            ownerName: 'Padma',
            doorNumber: '2-202',
            village: 'Eco Nagar',
            address: 'Library Street',
            dailyWaste: 2.1,
            recyclableWaste: 0.7,
            reducibleWaste: 0.4
        },

        {
            ownerName: 'Kiran',
            doorNumber: '2-203',
            village: 'Eco Nagar',
            address: 'East Street',
            dailyWaste: 3.2,
            recyclableWaste: 1.1,
            reducibleWaste: 0.5
        },


        {
            ownerName: 'Arjun',
            doorNumber: '3-301',
            village: 'River Side',
            address: 'River Road',
            dailyWaste: 2.4,
            recyclableWaste: 0.8,
            reducibleWaste: 0.4
        },

        {
            ownerName: 'Meena',
            doorNumber: '3-302',
            village: 'River Side',
            address: 'Garden Road',
            dailyWaste: 1.9,
            recyclableWaste: 0.6,
            reducibleWaste: 0.3
        },

        {
            ownerName: 'Vijay',
            doorNumber: '3-303',
            village: 'River Side',
            address: 'Canal Street',
            dailyWaste: 2.7,
            recyclableWaste: 0.9,
            reducibleWaste: 0.5
        }

    ];


    sampleRecords.forEach(
        data => {

            const monthlyWaste =
                data.dailyWaste * 30;


            const monthlyRecyclable =
                data.recyclableWaste * 30;


            const monthlyReducible =
                data.reducibleWaste * 30;


            const recyclablePercentage =
                (
                    data.recyclableWaste /
                    data.dailyWaste
                ) * 100;


            const reductionPercentage =
                (
                    data.reducibleWaste /
                    data.dailyWaste
                ) * 100;


            const remainingDailyWaste =
                data.dailyWaste -
                data.recyclableWaste -
                data.reducibleWaste;


            householdWaste.push({

                id:
                    generateHouseholdId(),

                user:
                    'Demo Data',

                ownerName:
                    data.ownerName,

                doorNumber:
                    data.doorNumber,

                village:
                    data.village,

                address:
                    data.address,

                dailyWaste:
                    data.dailyWaste,

                recyclableWaste:
                    data.recyclableWaste,

                reducibleWaste:
                    data.reducibleWaste,

                monthlyWaste,

                monthlyRecyclable,

                monthlyReducible,

                recyclablePercentage,

                reductionPercentage,

                remainingDailyWaste,

                monthlyRemainingWaste:
                    remainingDailyWaste * 30,

                date:
                    new Date().toISOString()

            });

        }
    );


    localStorage.setItem(
        'gl_sample_data_created',
        'true'
    );


    saveData();

}


// ============================================================
// DIY
// ============================================================

const diyData = [

    {
        title: "Self-Watering Planter",

        img:
            "https://placehold.co/200x150/4CAF50/FFFFFF.png?text=Planter",

        steps: [
            "Cut bottle in half.",
            "Poke hole in cap.",
            "Thread cotton string.",
            "Add water to base, soil to top."
        ],

        link:
            "https://www.youtube.com/results?search_query=how+to+make+plastic+bottle+self+watering+planter"
    },

    {
        title: "Eco-Bricks",

        img:
            "https://placehold.co/200x150/8BC34A/FFFFFF.png?text=Eco-Brick",

        steps: [
            "Clean soft plastics.",
            "Wash clear bottle.",
            "Pack plastics tightly into bottle with a stick.",
            "Use as building blocks."
        ],

        link:
            "https://www.youtube.com/results?search_query=how+to+make+eco+bricks+tutorial"
    },

    {
        title: "Bird Feeder",

        img:
            "https://placehold.co/200x150/FF9800/FFFFFF.png?text=Bird+Feeder",

        steps: [
            "Cut two holes near bottle bottom.",
            "Push wooden spoon through holes.",
            "Fill with birdseed.",
            "Hang from tree."
        ],

        link:
            "https://www.youtube.com/results?search_query=diy+plastic+bottle+bird+feeder"
    },

    {
        title: "Plastic Bag Basket",

        img:
            "https://placehold.co/200x150/03A9F4/FFFFFF.png?text=Basket",

        steps: [
            "Cut bags into loops.",
            "Interlock loops into plarn.",
            "Braid three strands.",
            "Coil and sew together."
        ],

        link:
            "https://www.youtube.com/results?search_query=how+to+weave+plastic+bag+basket"
    },

    {
        title: "Bottle Cap Art",

        img:
            "https://placehold.co/200x150/E91E63/FFFFFF.png?text=Cap+Art",

        steps: [
            "Collect colored caps.",
            "Draw outline on wood.",
            "Sort by color.",
            "Glue flat side down."
        ],

        link:
            "https://www.youtube.com/results?search_query=bottle+cap+mosaic+art+tutorial"
    },

    {
        title: "Spoon Lamp",

        img:
            "https://placehold.co/200x150/FFC107/FFFFFF.png?text=Lamp",

        steps: [
            "Snap handles off plastic spoons.",
            "Cut bottom off water jug.",
            "Glue spoon heads in layers.",
            "Add LED light."
        ],

        link:
            "https://www.youtube.com/results?search_query=diy+plastic+spoon+lamp"
    },

    {
        title: "Piggy Bank",

        img:
            "https://placehold.co/200x150/F06292/FFFFFF.png?text=Piggy+Bank",

        steps: [
            "Cut a coin slot in a bottle.",
            "Glue 4 bottle caps as legs.",
            "Paint the bottle pink.",
            "Draw eyes and snout."
        ],

        link:
            "https://www.youtube.com/results?search_query=plastic+bottle+piggy+bank+craft"
    },

    {
        title: "Pen Stand",

        img:
            "https://placehold.co/200x150/00BCD4/FFFFFF.png?text=Pen+Stand",

        steps: [
            "Cut top off a thick shampoo bottle.",
            "Sand the edges smooth.",
            "Decorate with paper or paint.",
            "Store your pens."
        ],

        link:
            "https://www.youtube.com/results?search_query=diy+plastic+bottle+pen+holder"
    }

];


function renderDIY() {

    const container =
        document.getElementById(
            'diy-container'
        );


    container.innerHTML = '';


    diyData.forEach(
        (item, index) => {

            container.innerHTML += `

                <div
                    class="card diy-card"
                    onclick="openModal(${index})">

                    <img
                        src="${item.img}"
                        alt="${item.title}">

                    <h3>
                        ${item.title}
                    </h3>

                </div>

            `;

        }
    );

}


function openModal(index) {

    const data =
        diyData[index];


    document
        .getElementById(
            'modal-title'
        )
        .innerText =
        data.title;


    document
        .getElementById(
            'modal-img'
        )
        .src =
        data.img;


    document
        .getElementById(
            'modal-link'
        )
        .href =
        data.link;


    const stepsContainer =
        document.getElementById(
            'modal-instructions'
        );


    stepsContainer.innerHTML = '';


    data.steps.forEach(
        step => {

            let li =
                document.createElement(
                    'li'
                );


            li.innerText =
                step;


            stepsContainer.appendChild(
                li
            );

        }
    );


    document
        .getElementById(
            'diy-modal'
        )
        .classList
        .remove('hidden');

}


function closeModal() {

    document
        .getElementById(
            'diy-modal'
        )
        .classList
        .add('hidden');

}


// ============================================================
// ECO GAME
// ============================================================

const gameItems = [

    {
        name: 'Banana Peel',
        type: 'wet',
        img:
            'https://placehold.co/100x100/FFEB3B/000000.png?text=Banana'
    },

    {
        name: 'Plastic Bottle',
        type: 'dry',
        img:
            'https://placehold.co/100x100/2196F3/FFFFFF.png?text=Bottle'
    },

    {
        name: 'Apple Core',
        type: 'wet',
        img:
            'https://placehold.co/100x100/F44336/FFFFFF.png?text=Apple'
    },

    {
        name: 'Battery',
        type: 'hazard',
        img:
            'https://placehold.co/100x100/9E9E9E/FFFFFF.png?text=Battery'
    },

    {
        name: 'Polythene',
        type: 'dry',
        img:
            'https://placehold.co/100x100/03A9F4/FFFFFF.png?text=Bag'
    },

    {
        name: 'Paint Can',
        type: 'hazard',
        img:
            'https://placehold.co/100x100/607D8B/FFFFFF.png?text=Paint'
    }

];


function initGame() {

    const area =
        document.getElementById(
            'items-area'
        );


    area.innerHTML = '';


    document
        .getElementById(
            'game-score'
        )
        .innerText =
        currentUser.gameScore || 0;


    gameItems.forEach(
        (item, index) => {

            let el =
                document.createElement(
                    'div'
                );


            el.className =
                'game-item';


            el.draggable =
                true;


            el.dataset.type =
                item.type;


            el.id =
                'item-' + index;


            el.innerHTML = `

                <img
                    src="${item.img}"
                    alt="${item.name}">

                <span>
                    ${item.name}
                </span>

            `;


            el.addEventListener(
                'dragstart',
                e => {

                    e.dataTransfer.setData(
                        'text/plain',
                        e.target.id
                    );

                }
            );


            area.appendChild(
                el
            );

        }
    );


    document
        .querySelectorAll('.bin')
        .forEach(
            bin => {

                bin.addEventListener(
                    'dragover',
                    e => {

                        e.preventDefault();

                        bin.classList.add(
                            'drag-over'
                        );

                    }
                );


                bin.addEventListener(
                    'dragleave',
                    e => {

                        bin.classList.remove(
                            'drag-over'
                        );

                    }
                );


                bin.addEventListener(
                    'drop',
                    handleDrop
                );

            }
        );

}


function handleDrop(e) {

    e.preventDefault();


    this.classList.remove(
        'drag-over'
    );


    const itemId =
        e.dataTransfer.getData(
            'text/plain'
        );


    const itemEl =
        document.getElementById(
            itemId
        );


    if (!itemEl) return;


    if (
        itemEl.dataset.type ===
        this.id.replace(
            'bin-',
            ''
        )
    ) {

        itemEl.remove();


        currentUser.gameScore =
            (
                currentUser.gameScore ||
                0
            ) + 10;


        document
            .getElementById(
                'game-score'
            )
            .innerText =
            currentUser.gameScore;


        const user =
            users.find(
                u =>
                    u.username ===
                    currentUser.username
            );


        if (user) {

            user.gameScore =
                currentUser.gameScore;

        }


        saveData();


        syncDataWarehouse();

    }

    else {

        alert(
            'Oops! That belongs in a different bin.'
        );

    }

}


function resetGame() {

    initGame();

}


// ============================================================
// INITIAL DATA SETUP
// ============================================================

// Create demonstration household records
// only on the first run.

createSampleVillageData();


// Make sure the warehouse exists
// and is synchronized.

syncDataWarehouse();