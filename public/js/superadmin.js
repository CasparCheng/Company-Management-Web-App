'use strict';

var numNewNotifications = document.getElementById('num-of-new-notifications');
var notificationBtn = document.getElementById('notification');
var notificationModal = document.getElementById('notification-modal');
var notifsContainer = document.getElementById('notifs');

var profileSwitch = document.getElementById('profile-switch');
var websiteInfoSwitch = document.getElementById('website-info-switch');
var allCompaniesSwitch = document.getElementById('all-companies-switch');
var allEmployeesSwitch = document.getElementById('all-employees-switch');

var profile = document.getElementById('profile');
var wesiteInfo = document.getElementById('website-info');
var allCompanies = document.getElementById('all-companies');
var allEmployees = document.getElementById('all-employees');

var profileForm = document.getElementById('profile-form');
var usernameInp = profileForm.querySelector('#username-profile');
var addressInp = profileForm.querySelector('#address-profile');
var emailInp = profileForm.querySelector('#email-profile');
var phoneInp = profileForm.querySelector('#phone-profile');

var websiteInfoForm = document.getElementById('website-info-form');
var ourCompanyInp = websiteInfoForm.querySelector('#our-company');
var pricingInp = websiteInfoForm.querySelector('#pricing');
var howToApplyInp = websiteInfoForm.querySelector('#how-to-apply');

var companiesContainer = document.getElementById('companies');
var companyTemplate = document.getElementById('company-template');

var employeesContainer = document.getElementById('employees');
var employeeTemplate = document.getElementById('employee-template');

var companyProfileFrom = document.getElementById('company-profile-form');
var usernameInpCompany = companyProfileFrom.querySelector('#username-company');
var addressInpCompany = companyProfileFrom.querySelector('#address-company');
var emailInpCompany = companyProfileFrom.querySelector('#email-company');
var phoneInpCompany = companyProfileFrom.querySelector('#phone-company');

var employeeProfileFrom = document.getElementById('employee-profile-form');
var usernameInpEmployee = employeeProfileFrom.querySelector('#username-employee');
var addressInpEmployee = employeeProfileFrom.querySelector('#address-employee');
var emailInpEmployee = employeeProfileFrom.querySelector('#email-employee');
var phoneInpEmployee = employeeProfileFrom.querySelector('#phone-employee');
var belongsToInpEmployee = employeeProfileFrom.querySelector('#belongs-to-employee');

var companyProfileModal = document.getElementById('company-profile-modal');
var employeeProfileModal = document.getElementById('employee-profile-modal');

var companyOptTemplate = document.getElementById('company-opt-template');

var notifTemplate = document.getElementById('notif-template');


$(profileForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/superadmin/profile',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });

    e.preventDefault();
});

$(websiteInfoForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/website-info',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });

    e.preventDefault();
});

$(companyProfileFrom).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/set-company',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        requestAllCompanies();
        companyProfileModal.style.display = 'none';
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });

    e.preventDefault();
});

$(employeeProfileFrom).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/set-employee',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        requestAllEmployees();
        employeeProfileModal.style.display = 'none';
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });

    e.preventDefault();
});

function deactivateAll() {
    var activeSwitches = document.querySelectorAll('.switch.active');
    for (var activeSwitch of activeSwitches) {
        activeSwitch.classList.remove('active');
    }
    var activeContentCards = document.querySelectorAll('.content-card.active');
    for (var activeContentCard of activeContentCards) {
        activeContentCard.classList.remove('active');
    }
}

function requestProfile() {
    $.ajax({
        type: 'GET',
        url: '/superadmin/profile',
        dataType: 'json'
    }).done(function (data) {
        usernameInp.value = data.username;
        addressInp.value = data.address;
        emailInp.value = data.email;
        phoneInp.value = data.phone;
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function requestWebsiteInfo() {
    $.ajax({
        type: 'GET',
        url: '/website-info',
        dataType: 'json'
    }).done(function (data) {
        ourCompanyInp.value = data.ourCompany;
        pricingInp.value = data.pricing;
        howToApplyInp.value = data.howToApply;
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function requestAllCompanies() {
    $.ajax({
        type: 'GET',
        url: '/all-companies',
        dataType: 'json'
    }).done(function (data) {
        var html = '';
        var companies = data.companies;
        if (companies.length != 0) {
            for (var company of companies) {
                html += Mustache.to_html(
                    companyTemplate.innerHTML, company
                );
            }
        } else {
            html = '<tr><td class="prompt" colspan="100%">There is no company registered now ……</td></tr>';
        }
        companiesContainer.innerHTML = html;
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function requestAllEmployees() {
    $.ajax({
        type: 'GET',
        url: '/all-employees',
        dataType: 'json'
    }).done(function (data) {
        var html = '';
        var employees = data.employees;
        if (employees.length != 0) {
            for (var employee of employees) {
                html += Mustache.to_html(
                    employeeTemplate.innerHTML, employee
                );
            }
        } else {
            html = '<tr><td class="prompt" colspan="100%">There is no employee registered now ……</td></tr>';
        }
        employeesContainer.innerHTML = html;
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function showCompany(username) {
    $.ajax({
        type: 'GET',
        url: '/get-company',
        dataType: 'json',
        data: {
            username: username,
        }
    }).done(function (data) {
        console.log(data);
        usernameInpCompany.value = data.username;
        addressInpCompany.value = data.address;
        emailInpCompany.value = data.email;
        phoneInpCompany.value = data.phone;
        companyProfileModal.style.display = 'block';
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function deleteCompany(username) {
    $.ajax({
        type: 'POST',
        url: '/delete-company',
        data: {
            username: username,
        }
    }).done(function (data) {
        console.log(data);
        requestAllCompanies();
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function showEmployee(username) {
    $.ajax({
        type: 'GET',
        url: '/get-employee',
        dataType: 'json',
        data: {
            username: username,
        }
    }).done(function (data) {
        console.log(data);
        usernameInpEmployee.value = data.username;
        addressInpEmployee.value = data.address;
        emailInpEmployee.value = data.email;
        phoneInpEmployee.value = data.phone;
        var html = '<option value=""></option>';
        var companies = data.companies;
        for (var company of companies) {
            html += Mustache.to_html(
                companyOptTemplate.innerHTML, company
            );
        }
        belongsToInpEmployee.innerHTML = html;
        employeeProfileModal.style.display = 'block';
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function deleteEmployee(username) {
    $.ajax({
        type: 'POST',
        url: '/delete-employee',
        data: {
            username: username,
        }
    }).done(function (data) {
        console.log(data);
        requestAllEmployees();
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function updateNumNewNotifs() {
    $.ajax({
        type: 'GET',
        url: '/superadmin/num-new-notifs',
        dataType: 'json',
    }).done(function (data) {
        console.log(data);
        numNewNotifications.innerText = data.numNewNotifications;
    }).fail(function (data) {
        console.log(data);
    });
}

function showNotifs() {
    $.ajax({
        type: 'GET',
        url: '/superadmin/notifs',
        dataType: 'json',
    }).done(function (data) {
        console.log(data);
        var html = '';
        var notifs = data.notifs;
        if (notifs.length != 0) {
            for (var notif of notifs) {
                html += Mustache.to_html(
                    notifTemplate.innerHTML, notif
                );
            }
        } else {
            html = '<div class="prompt">No entries yet ...</div>';
        }
        notifsContainer.innerHTML = html;
        notificationModal.style.display = 'block';
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function readNotif(id) {
    $.ajax({
        type: 'POST',
        url: '/superadmin/read-notif',
        data: {
            id: id
        }
    }).done(function (data) {
        console.log(data);
        updateNumNewNotifs();
        showNotifs();
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function deleteNotif(id) {
    $.ajax({
        type: 'POST',
        url: '/superadmin/delete-notif',
        data: {
            id: id
        }
    }).done(function (data) {
        console.log(data);
        updateNumNewNotifs();
        showNotifs();
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

profileSwitch.onclick = function () {
    deactivateAll();
    requestProfile();
    profileSwitch.classList.add('active');
    profile.classList.add('active');
};

websiteInfoSwitch.onclick = function () {
    deactivateAll();
    requestWebsiteInfo();
    websiteInfoSwitch.classList.add('active');
    wesiteInfo.classList.add('active');
};

allCompaniesSwitch.onclick = function () {
    deactivateAll();
    requestAllCompanies();
    allCompaniesSwitch.classList.add('active');
    allCompanies.classList.add('active');
};

allEmployeesSwitch.onclick = function () {
    deactivateAll();
    requestAllEmployees();
    allEmployeesSwitch.classList.add('active');
    allEmployees.classList.add('active');
};

notificationBtn.onclick = function () {
    showNotifs();
};

window.onclick = function (evt) {
    if (evt.target == notificationModal) {
        notificationModal.style.display = 'none';
    } else if (evt.target == companyProfileModal) {
        companyProfileModal.style.display = 'none';
    } else if (evt.target == employeeProfileModal) {
        employeeProfileModal.style.display = 'none';
    }
};

setInterval(updateNumNewNotifs, 5000);
