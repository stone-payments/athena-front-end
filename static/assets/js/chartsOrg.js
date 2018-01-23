$(function() {
  let commitsCharts = null;
  let languages = null;
  let issuesChart = null;
  let openSourceChart = null;
  let readmeChart = null;
  let openSourceReadme = null;
  let LicenseType = null;
  let startDay = moment().startOf('month').format('YYYY-MM-DD');
  let lastDay = moment().format('YYYY-MM-DD')
  colors = ['#0e6251', '#117864', '#148f77', '#17a589', '#1abc9c', '#48c9b0', '#76d7c4', '#a3e4d7', '#d1f2eb',
    '#fef5e7', '#fdebd0', '#fad7a0', '#f8c471', '#f5b041', '#f39c12', '#d68910', '#b9770e', '#9c640c', '#7e5109'
  ]
  colorStone = ['#0B3B1F', '#1DAC4B', '#380713', '#74121D', '#C52233', '#595708', '#657212', '#ABC421']
  let spinner = `<div class="spinner">
                <div class="wBall" id="wBall_1">
                    <div class="wInnerBall"></div>
                </div>
                <div class="wBall" id="wBall_2">
                    <div class="wInnerBall"></div>
                </div>
                <div class="wBall" id="wBall_3">
                    <div class="wInnerBall"></div>
                </div>
                <div class="wBall" id="wBall_4">
                    <div class="wInnerBall"></div>
                </div>
                <div class="wBall" id="wBall_5">
                    <div class="wInnerBall"></div>
                </div>
            </div>`
    $.ajax({
          url: '/get_org_names',
          type: 'GET',
          success: function(response) {
            returnedData = JSON.parse(response);
            $("#name").empty();
            returnedData.map(function(name) {
                $('#name')
                 .append($("<option></option>")
                 .attr("value",name.org)
                 .text(name.org));
            });
          },
          error: function(error) {
            console.log(error);
          }
        });

  $('#name').keypress(function(e) {
    if (e.which == 13) { //Enter key pressed
      $('#find').click(); //Trigger search button click event
    }
  });
  setInterval(function(){
   $('#find').click();
 }, 300000);
  $("#find").click(function() {
      $(".content").show();
    name = $("#name").val();
    if ($("#org").val()) {
      startDay = JSON.parse($("#org").val()).start;
      lastDay = JSON.parse($("#org").val()).end;
    }
    $.ajax({
      url: '/get_org_info?name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let url = String(returnedData[0]['avatarUrl']);
        let repoCount = String(returnedData[0]['repoCount']);
        let membersCount = String(returnedData[0]['membersCount']);
        let teamsCount = String(returnedData[0]['teamsCount']);
        let projectCount = String(returnedData[0]['projectCount']);
        let orgName = String(returnedData[0]['org']);
        let orgLastUpdated = String(returnedData[0]['db_last_updated']);
        $('#avatar').attr("src", url);
        $('#membersCount').text(membersCount);
        $('#orgName').text(orgName);
        $('#repoCount').text(repoCount);
        $('#teamsCount').text(teamsCount);
        $('#projectCount').text(projectCount);
        $('#orgLastUpdated').html('<i class="fa fa-clock-o"></i> '+ orgLastUpdated + ' minutes ago');
      },

      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/get_languages_org?name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labels = returnedData.map(function(num) {
          return num.languages;
        });
        let dataSize = returnedData.map(function(num) {
          return num.count;
        });
        if (languages != null) {
          languages.destroy();
        }
        languages = new Chart(document.getElementById("languages"), {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: "Languages (%)",
              backgroundColor: colors,
              borderWidth: 1,
              data: dataSize
            }]
          },
          options: {
            tooltips: {
              mode: 'index',
              intersect: false
            },
            scales: {
              yAxes: [{
              gridLines: {
                            drawBorder: true,
                            color: 'rgba(18, 170, 75, 0.1)'
                        },
                ticks: {

                  beginAtZero: true,
                  autoSkip: false,
                  maxTicksLimit: 100,
                  responsive: true
                }
              }],
              xAxes: [{
              gridLines: {
                            display: false
                        },
                ticks: {
                  autoSkip: false,
                  responsive: true
                }
              }]
            }
          }
        });
      },
      error: function(error) {
        console.log(error);
        if (languages != null) {
          languages.destroy();
        }
      }
    });
    $.ajax({
      url: '/get_commits_org?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsCommit = returnedData.map(function(num) {
          return num.day;
        });
        let dataCommits = returnedData.map(function(num) {
          return num.count;
        });
        let ctx = document.getElementById("commitsCharts").getContext('2d');
        if (commitsCharts != null) {
          commitsCharts.destroy();
        }
        commitsCharts = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labelsCommit,
            datasets: [{
              label: 'num of Commits',
              data: dataCommits,
              backgroundColor: [
                'rgba(24, 165, 137, 0.2)'
              ],
              borderColor: [
                 'rgba(24, 165, 137, 1)'
              ],
              borderWidth: 1,
              lineTension: 0
            }]
          },
          options: {
            maintainAspectRatio: true,
            tooltips: {
              mode: 'index',
              intersect: false
            },
            scales: {
              xAxes: [{
              gridLines: {
                            display: false
                        },
                ticks: {
                  autoSkip: labelsCommit.length > 31 ? true : false,
                  beginAtZero: true,
                  responsive: true,
                }
              }],
              yAxes: [{
              gridLines: {
                            drawBorder: true,
                            color: 'rgba(18, 170, 75, 0.1)'
                        },
                ticks: {
                  suggestedMax: 10,
                  beginAtZero: true,
                  callback: function(value, index, values) {
                    if (Math.floor(value) === value) {
                      return value;
                    }
                  }
                }
              }]
            }
          },
        });
      },
      error: function(error) {
        console.log(error);
        if (commitsCharts != null) {
          commitsCharts.destroy();
        }
      }
    });
    $.ajax({
      url: '/get_open_source_org?name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsCommit = returnedData.map(function(num) {
          return num.status;
        });
        let dataCommits = returnedData.map(function(num) {
          return num.count;
        });
        if (openSourceChart != null) {
          openSourceChart.destroy();
        }
        openSourceChart = new Chart(document.getElementById("openSourceChart"), {
          type: 'doughnut',
          data: {
            labels: labelsCommit,
            datasets: [{
              label: "",
              backgroundColor: ['#C52233', '#0B3B1F'],
              borderWidth: 1,
              data: dataCommits
            }]
          },
          options: {
            responsive: true
          }
        });
      },
      error: function(error) {
        console.log(error);
        if (openSourceChart != null) {
          openSourceChart.destroy();
        }
      }
    });
    $.ajax({
      url: '/get_readme_org?name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsReadme = returnedData.map(function(num) {
          return num.status;
        });
        let dataReadme = returnedData.map(function(num) {
          return num.count;
        });
        if (readmeChart != null) {
          readmeChart.destroy();
        }
        readmeChart = new Chart(document.getElementById("readmeChart"), {
          type: 'doughnut',
          data: {
            labels: labelsReadme,
            datasets: [{
              label: "",
              backgroundColor: [ '#ABC421', '#0B3B1F', '#C52233'],
              borderWidth: 1,
              data: dataReadme
            }]
          },
          options: {
            responsive: true
          }
        });
      },
      error: function(error) {
        console.log(error);
        if (readmeChart != null) {
          readmeChart.destroy();
        }
      }
    });
    $.ajax({
      url: '/get_open_source_readme_org?name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsReadme = returnedData.map(function(num) {
          return num.status;
        });
        let dataReadme = returnedData.map(function(num) {
          return num.count;
        });
        if (openSourceReadme != null) {
          openSourceReadme.destroy();
        }
        openSourceReadme = new Chart(document.getElementById("openSourceReadme"), {
          type: 'doughnut',
          data: {
            labels: labelsReadme,
            datasets: [{
              label: "",
              backgroundColor: [ '#ABC421', '#0B3B1F', '#C52233'],
              borderWidth: 1,
              data: dataReadme
            }]
          },
          options: {
            responsive: true
          }
        });
      },
      error: function(error) {
        console.log(error);
        if (openSourceReadme != null) {
          openSourceReadme.destroy();
        }
      }
    });
    $.ajax({
      url: '/get_license_type_org?name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsLicense = returnedData.map(function(num) {
          return num.license;
        });
        let dataLicense = returnedData.map(function(num) {
          return num.count;
        });
        if (LicenseType != null) {
          LicenseType.destroy();
        }
        LicenseType = new Chart(document.getElementById("LicenseType"), {
          type: 'bar',
          data: {
            labels: labelsLicense,
            datasets: [{
              label: "License type",
              backgroundColor: ['rgb(168,169,173)', '#0B3B1F', '#1DAC4B', '#380713', '#74121D', '#C52233', '#595708', '#657212', '#ABC421'],
              borderWidth: 1,
              data: dataLicense
            }]
          },
          options: {
            tooltips: {
              mode: 'index',
              intersect: false
            },
            scales: {
              xAxes: [{
              gridLines: {
                            display: false
                        },
                ticks: {
                  autoSkip: false,
                  responsive: true
                }
              }],
              yAxes: [{
              gridLines: {
                            drawBorder: true,
                            color: 'rgba(18, 170, 75, 0.1)'
                        },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 100,
                  responsive: true,
                  beginAtZero: true
                }
              }]
            },
          }
        });
      },
      error: function(error) {
        console.log(error);
        if (LicenseType != null) {
          LicenseType.destroy();
        }
      }
    });
    $.ajax({
      url: '/get_issues_org?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsIssues1 = returnedData[0].map(function(num) {
          return num.day;
        });
        let dataIssues1 = returnedData[0].map(function(num) {
          return num.count;
        });
        let dataIssues2 = returnedData[1].map(function(num) {
          return num.count;
        });
        let ctx = document.getElementById("issuesChart").getContext('2d');
        if (issuesChart != null) {
          issuesChart.destroy();
        }
        issuesChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labelsIssues1,
            datasets: [{
                label: 'num of Closed Issues',
                data: dataIssues1,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                  'rgba(255,99,132,1)'
                ],
                borderWidth: 1,
                lineTension: 0
              },
              {
                label: 'num of Created Issues',
                data: dataIssues2,

                backgroundColor: [
                  'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                  'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1,
                lineTension: 0
              }
            ]
          },
          options: {
            tooltips: {
              mode: 'index',
              intersect: false
            },
            scales: {
              xAxes: [{
              gridLines: {
                            display: false
                        },
                ticks: {
                  autoSkip: labelsIssues1.length > 31 ? true : false,
                  responsive: true
                }
              }],
              yAxes: [{
              gridLines: {
                            drawBorder: true,
                            color: 'rgba(18, 170, 75, 0.1)'
                        },
                ticks: {
                  beginAtZero: true,
                  callback: function(value, index, values) {
                    if (Math.floor(value) === value) {
                      return value;
                    }
                  }
                }
              }]
            },
          }
        });
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
});
