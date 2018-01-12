$(function() {
  let commitsChart = null;
  let languages = null;
  let issuesChart = null;
  let openSourceChart = null;
  let readmeChart = null;
  let LicenseType = null;
  let startDay = moment().startOf('month').format('YYYY-MM-DD');
  let lastDay = moment().format('YYYY-MM-DD')
   $('#orgSelector').on('change', function() {
     orgSelector = $('#orgSelector').val();
  }),
  colors = ['#0e6251', '#117864', '#148f77', '#17a589', '#1abc9c', '#48c9b0', '#76d7c4', '#a3e4d7', '#d1f2eb',
    '#fef5e7', '#fdebd0', '#fad7a0', '#f8c471', '#f5b041', '#f39c12', '#d68910', '#b9770e', '#9c640c', '#7e5109'
  ]
  colorStone = ['#0B3B1F', '#1DAC4B', '#380713', '#74121D', '#C52233', '#595708', '#657212', '#ABC421']
    $.ajax({
              url: '/get_org_names',
              type: 'GET',
              success: function(response) {
                returnedData = JSON.parse(response);
                orgSelector = returnedData[0].org;
                $("#orgSelector").empty();
                returnedData.map(function(name) {
                    $('#orgSelector')
                     .append($("<option></option>")
                     .attr("value",name.org)
                     .text(name.org));
                });
                if ($("#name").data("name") != 'None'){
                    let name = $("#name").data("name");
                    let org = $("#name").data("org");
                    $('#orgSelector ').val(org).change();
                    $("#name").val(name);
                    $('#find').click();
                   };
              },
              error: function(error) {
                console.log(error);
              }
            });
      let xhr;
  $('#name').autoComplete({
    minChars: 1,cache: false, delay : 20,
    source: function(term, response) {
    $('.autocomplete-suggestion').show();
     $.getJSON('/get_team_name?name=' + term+'&org='+ orgSelector, function(result) {
        let returnedData = result.map(function(num) {
          return num.slug;
        });
        response(returnedData);
      });
    },
    onSelect: function(e, term, item){
         $('#find').click();
    }
  });
  $('#name').keypress(function(e) {
    if (e.which == 13) { //Enter key pressed
      $('.autocomplete-suggestion').hide();
      $('.autocomplete-suggestions').hide();
      $('#find').click(); //Trigger search button click event
    }
  });
  $("#find").click(function() {
    name = $("#name").val();
    orgSelector = $("#orgSelector").val();
    if ($("#teamsRangeDate").val()) {
      startDay = JSON.parse($("#teamsRangeDate").val()).start;
      lastDay = JSON.parse($("#teamsRangeDate").val()).end;
    }
    $.ajax({
      url: '/team_check_with_exist?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        if (returnedData['response'] == 404){
          $(".content").hide();
          $(document).ready(function() {
            $.notify({
              icon: 'pe-7s-close-circle',
              message: "Team does not exist"
            }, {
              type: 'danger',
              timer: 1000,
              placement: {
            		from: 'top',
            		align: 'right'
            	},
            });
          });
        }
        else {
          $(".content").show();
        }
      },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/get_open_source_team?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labels = returnedData.map(function(num) {
          return num.status;
        });
        let dataSize = returnedData.map(function(num) {
          return num.count;
        });
        if (openSourceChart != null) {
          openSourceChart.destroy();
        }
        openSourceChart = new Chart(document.getElementById("openSourceChart"), {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              label: "",
              backgroundColor: ['#C52233', '#0B3B1F'],
              borderWidth: 1,
              data: dataSize
            }]
          },
          options: {
            responsive: true
          }
        });
      },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/get_readme_team?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labels = returnedData.map(function(num) {
          return num.status;
        });
        let dataSize = returnedData.map(function(num) {
          return num.count;
        });
        if (readmeChart != null) {
          readmeChart.destroy();
        }
        readmeChart = new Chart(document.getElementById("readmeChart"), {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              label: "Languages (%)",
              backgroundColor: ['#ABC421', '#0B3B1F', '#C52233'],
              borderWidth: 1,
              data: dataSize
            }]
          },
          options: {
            responsive: true
          }
        });
      },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/get_license_type_team?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsLicense = returnedData.map(function(num) {
          return num.status;
        });
        let dataLicense = returnedData.map(function(num) {
          return num.count;
        });
        if (LicenseType != null) {
          LicenseType.destroy();
        }
        LicenseType = new Chart(document.getElementById("LicenseType"), {
          type: 'doughnut',
          data: {
            labels: labelsLicense,
            datasets: [{
              label: "License (%)",
              backgroundColor: ['rgb(12,58,31)', 'rgb(18,170,75)','rgb(149,201,61)','rgb(214,234,206)', 'rgb(214,234,206)','rgb(168,169,173)','rgb(92,101,105)'],
              borderWidth: 1,
              data: dataLicense
            }]
          },
        });
      },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/get_languages_team?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labels = returnedData.map(function(num) {
          return num.language;
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
                            display: false,
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
      }
    });
    $.ajax({
      url: '/get_repo_members_team?org=' + 'stone-payments' + '&name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        $("#members").empty();
        returnedData.map(function(num) {
          memberName = num.member;
          html = `<tr class="elements-list" onclick="window.location='/user?name=${memberName}';" style="cursor: pointer;">
                        <td style="width:10px;">
                                <i class="pe-7s-angle-right-circle"></i>
                        </td>
                        <td>${memberName}</td>
                        <td class="td-actions text-right">
                        </td>
                    </tr>`
          $("#members").append(html);
        });
      },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/get_commits_team?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay + '&org=' + orgSelector,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsCommit = returnedData.map(function(num) {
          return num.day;
        });
        let dataCommits = returnedData.map(function(num) {
          return num.count;
        });
        let ctx = document.getElementById("commitsChart").getContext('2d');

        if (commitsChart != null) {
          commitsChart.destroy();
        }
        commitsChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labelsCommit,
            datasets: [{
              label: 'num of Commits',
              data: dataCommits,
              backgroundColor: [
                'rgba(18, 170, 75, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                'rgba(18, 170, 75, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
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
                            display: false,
                        },
                ticks: {
                  autoSkip: labelsCommit.length > 31 ? true : false,
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
                  responsive: true,
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
      }
    });
    $.ajax({
      url: '/get_issues_team?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay + '&org=' + orgSelector,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsIssues1 = returnedData[0].map(function(num) {
          return num.day;
        });
        let closedIssue = returnedData[0].map(function(num) {
          return num.count;
        });
        let createdIssue = returnedData[1].map(function(num) {
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
                label: 'num of Created Issues',
                data: createdIssue,
                backgroundColor: [
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1,
                lineTension: 0
              },
              {
                label: 'num of Closed Issues',
                data: closedIssue,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
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
                            display: false,
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
    $(".content").show();
  });
});
