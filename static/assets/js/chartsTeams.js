$(function() {
  let commitsChart = null;
  let work_profile = null;
  let languages = null;
  let issuesChart = null;
  let openSourceChart = null;
  let readmeChart = null;
  let LicenseType = null;
  let readmeLanguage = null;
  let startDay = moment().startOf('month').format('YYYY-MM-DD');
  let lastDay = moment().format('YYYY-MM-DD')
   $('#orgSelector').on('change', function() {
     orgSelector = $('#orgSelector').val();
  }),
  colors = ['#0e6251', '#117864', '#148f77', '#17a589', '#1abc9c', '#48c9b0', '#76d7c4', '#a3e4d7', '#d1f2eb',
    '#fef5e7', '#fdebd0', '#fad7a0', '#f8c471', '#f5b041', '#f39c12', '#d68910', '#b9770e', '#9c640c', '#7e5109'
  ]
  colorStone = ['#0B3B1F', '#1DAC4B', '#380713', '#74121D', '#C52233', '#595708', '#657212', '#ABC421']
  spinner = `<div class="windows8">
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
    $("#openSourceChartSpinner").html(spinner);
    $("#readmeSpinner").html(spinner);
    $("#licenseSpinner").html(spinner);
    $("#commitsSpinner").html(spinner);
    $("#memberSpinner").html(spinner);
    $("#languageSpinner").html(spinner);
    $("#issuesSpinner").html(spinner);
    $("#newWorkSpinner").html(spinner);
    $("readmeLanguageSpinner").html(spinner);
    $.ajax({
              url: '/org_names',
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
     $.getJSON('/team_name?name=' + term+'&org='+ orgSelector, function(result) {
        console.log(result)
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
      url: '/team_open_source?org=' + orgSelector + '&name=' + name,
      type: 'GET',
       beforeSend: function() {
       if (openSourceChart != null) {
          openSourceChart.destroy();
        }
         $("#openSourceChartSpinner").css('display', 'flex')
      },
      success: function(response) {
        returnedData = JSON.parse(response);
        let labels = returnedData.map(function(num) {
          return num.status;
        });
        let dataSize = returnedData.map(function(num) {
          return num.count;
        });

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
      complete: function (data) {
           $("#openSourceChartSpinner").css('display', 'none');
         },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/team_new_work?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay + '&org=' +  orgSelector,
      type: 'GET',
      beforeSend: function() {
      if (work_profile != null) {
          work_profile.destroy();
        }
         $("#newWorkSpinner").css('display', 'flex')
      },

      success: function(response) {
        returnedData = JSON.parse(response);
        average = returnedData[1];
        console.log(average);
        returnedData = returnedData[0];
    let info = returnedData.map(function(data) {
          return data[0];
        });
     let data = returnedData.map(function(data) {
          return data[1];
        });
     let labelNames = returnedData.map(function(data) {
          return data[0]['author'];
        });
    let ctx = document.getElementById("work_profile").getContext('2d');
    var customTooltips = function (tooltip) {
			$(this._chart.canvas).css("cursor", "pointer");

			var positionY = this._chart.canvas.offsetTop;
			var positionX = this._chart.canvas.offsetLeft;

			$(".chartjs-tooltip").css({
				opacity: 10,
			});}
    work_profile = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: name,
            borderColor: randomColor({count: labelNames.length, seed: 11}),
            backgroundColor: randomColor({count: labelNames.length, seed: 11}),
			pointBackgroundColor: randomColor({count: labelNames.length, seed: 11}),
            pointBorderColor: randomColor({count: labelNames.length, seed: 11}),
			pointRadius: 9,
			pointHoverRadius: 8,
            data: data
        },
        {
            label: 'average',
            borderColor: '#1DAC4B',
            borderWidth: 4,
            backgroundColor: '#0B3B1F',
			pointBackgroundColor: '#0B3B1F',
            pointBorderColor: '#1DAC4B',
			pointRadius: 12,
			pointStyle: 'triangle',
			pointHoverRadius: 11,
            data: [average]
        },
     ]
    },
    options: {
    legend: {
            position: 'bottom',
            labels: {
            usePointStyle: true,
                padding: 20,
            }

            },
    tooltips: {
              mode: 'nearest',
              intersect: true,
			  callbacks: {
                title: function(tooltipItem, datasetIndex, data) {
                if(tooltipItem[0]['datasetIndex'] === 1){
                    return 'average';
                }
                  return info[tooltipItem[0]['index']]['author'];
                },
                beforeLabel: function(tooltipItem, datasetIndex, data) {
                if (tooltipItem.datasetIndex !== 1){
                  return 'Total commits: '+ info[tooltipItem['index']]['commits'];}
                },
                label: function(tooltipItem, data) {
                if (tooltipItem.datasetIndex !== 1){
                  return 'Total additions: '+ info[tooltipItem['index']]['additions'];
                  }
                },
                afterLabel: function(tooltipItem, data) {
                if (tooltipItem.datasetIndex !== 1){
                  return 'Total deletions: ' + info[tooltipItem['index']]['deletions'];
                  }
                },
              },
            },
    layout :{
    padding: {
                left: 10,
                right: 10,
                top: 0,
                bottom: 0
            }
    },
            scales: {
                xAxes: [{
                id: "x-axis-1",
                scaleLabel: {
                                display: true,
                                labelString: 'New Work',
                                padding: 0,
                            },
                    ticks: {
                          min: -101,
                          max: 101,
                          display: false,
                        },
                    gridLines: {
                                drawBorder: true,
                                color: 'rgba(18, 170, 75, 0.1)',
                            },
                    position: 'top'
                },
                {
                id: "x-axis-2",
                scaleLabel: {
                                display: true,
                                labelString: 'Code Refactoring',
                                padding: 0,
                            },
                    ticks: {
                          min: -101,
                          max: 101,
                          display: false
                        },
                    gridLines: {
                                drawBorder: true,
                                color: 'rgba(18, 170, 75, 0.1)',
                            },
                    position: 'bottom'
                }
                ],
                yAxes: [{
                display: true,
                position: 'right',
                id: "y-axis-1",
                scaleLabel: {
                                display: true,
                                labelString: 'Higher Committer',
                                padding: 0,

                            },
                    ticks: {
                          min: -101,
                          max: 101,
                          display: false
                        },
                  gridLines: {
                                drawBorder: true,
                                color: 'rgba(18, 170, 75, 0.1)'
                            },
                },
                {
                display: true,
                position: 'left',
                id: "y-axis-2",
                            scaleLabel: {
                                display: true,
                                labelString: 'Lower Committer',
                                padding: 0,

                            },
                    ticks: {
                          min: -101,
                          max: 101,
                          display: false
                        },
                  gridLines: {
                                drawBorder: true,
                                color: 'rgba(18, 170, 75, 0.1)'
                            },
                }]
            }
        }
    });
      },
      complete: function (data) {
          $("#newWorkSpinner").css('display', 'none')
         },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/team_readme?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      beforeSend: function() {
       if (readmeChart != null) {
          readmeChart.destroy();
        }
         $("#readmeSpinner").css('display', 'flex')
      },
      success: function(response) {
        returnedData = JSON.parse(response);
        let labels = returnedData.map(function(num) {
          return num.status;
        });
        let dataSize = returnedData.map(function(num) {
          return num.count;
        });

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
      complete: function (data) {
           $("#readmeSpinner").css('display', 'none');
         },
      error: function(error) {
        console.log(error);
      }
    });

    $.ajax({
      url: '/team_license?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      beforeSend: function() {
      if (LicenseType != null) {
          LicenseType.destroy();
        }
         $("#licenseSpinner").css('display', 'flex')
      },
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsLicense = returnedData.map(function(num) {
          return num.status;
        });
        let dataLicense = returnedData.map(function(num) {
          return num.count;
        });
        if (labelsLicense.length > 3){
        LicenseType = new Chart(document.getElementById("LicenseType"), {
          type: 'bar',
          data: {
            labels: labelsLicense,
            datasets: [{
              label: "Languages (%)",
              backgroundColor: colorStone,
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
        }
        else{
        LicenseType = new Chart(document.getElementById("LicenseType"), {
          type: 'doughnut',
          data: {
            labels: labelsLicense,
            datasets: [{
              label: "License (%)",
              backgroundColor: colorStone,
              borderWidth: 1,
              data: dataLicense
            }]
          },
        });
        }
      },
      complete: function (data) {
           $("#licenseSpinner").css('display', 'none');
         },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/team_repositories_readme?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      beforeSend: function() {
      $("#team_repositories_readme").empty();
      },
      success: function(response) {
        returnedData = JSON.parse(response);
        returnedData.map(function(num) {
          repoName = num.repoName;
          status = num.status;
          if(status === "None"){
            flag = "danger";
          }
          else if(status === "Poor"){
            flag = "warning";
          }
          else {
            flag = "success";
          }
          html =   `<tr class="elements-list" onclick="window.location='/repos?org=${orgSelector}&name=${repoName}';" style="cursor: pointer;">
                        <td style="width:10px;">
                                <i class="pe-7s-angle-right-circle"></i>
                        </td>
                        <td>${repoName}
                        </td>
                        <td class="td-actions text-right">
                        <span class="label label-${flag}">${status}</span>
                        </td>
                    </tr>`
          $("#team_repositories_readme").append(html);
        });
      },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/team_readme_languages?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      beforeSend: function() {
      if (readmeLanguage != null) {
          readmeLanguage.destroy();
        }
         $("#readmeLanguageSpinner").css('display', 'flex')
      },
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsLicense = returnedData.map(function(num) {
          return num.language;
        });
        let dataLicense = returnedData.map(function(num) {
          return num.count;
        });
        if (labelsLicense.length > 3){
        readmeLanguage = new Chart(document.getElementById("readmeLanguage"), {
          type: 'bar',
          data: {
            labels: labelsLicense,
            datasets: [{
              label: "Languages (%)",
              backgroundColor: colorStone,
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
        }
        else{
        readmeLanguage = new Chart(document.getElementById("readmeLanguage"), {
          type: 'doughnut',
          data: {
            labels: labelsLicense,
            datasets: [{
              label: "License (%)",
              backgroundColor: colorStone,
              borderWidth: 1,
              data: dataLicense
            }]
          },
        });
        }
      },
      complete: function (data) {
           $("#readmeLanguageSpinner").css('display', 'none');
         },
      error: function(error) {
        console.log(error);
      }
    });

    $.ajax({
      url: '/team_languages?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      beforeSend: function() {
      if (languages != null) {
          languages.destroy();
        }
         $("#languageSpinner").css('display', 'flex')
      },
      success: function(response) {
        returnedData = JSON.parse(response);
        let labels = returnedData.map(function(num) {
          return num.language;
        });
        let dataSize = returnedData.map(function(num) {
          return num.count;
        });

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
      complete: function (data) {
           $("#languageSpinner").css('display', 'none');
         },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/team_repo_members?org=' + orgSelector + '&name=' + name,
      type: 'GET',
      beforeSend: function() {
         $("#members").empty();
         $("#memberSpinner").css('display', 'flex')
      },
      success: function(response) {
        returnedData = JSON.parse(response);

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
      complete: function (data) {
           $("#memberSpinner").css('display', 'none');
         },
      error: function(error) {
        console.log(error);
      }
    });

    $.ajax({
      url: '/team_commits?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay + '&org=' + orgSelector,
      type: 'GET',
      beforeSend: function() {
      if (commitsChart != null) {
          commitsChart.destroy();
        }
         $("#commitsSpinner").css('display', 'flex')
      },
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsCommit = returnedData.map(function(num) {
          return num.day;
        });
        let dataCommits = returnedData.map(function(num) {
          return num.count;
        });
        let ctx = document.getElementById("commitsChart").getContext('2d');

        commitsChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labelsCommit,
            datasets: [{
              label: 'num of Commits',
              data: dataCommits,
              backgroundColor: [
                'rgba(18, 170, 75, 0.2)'
              ],
              borderColor: [
                'rgba(18, 170, 75, 1)'
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
      complete: function (data) {
           $("#commitsSpinner").css('display', 'none');
         },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/team_issues?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay + '&org=' + orgSelector,
      type: 'GET',
      beforeSend: function() {
      if (issuesChart != null) {
          issuesChart.destroy();
        }
         $("#issuesSpinner").css('display', 'flex')
      },
      success: function(response) {
        returnedData = JSON.parse(response);
        console.log(returnedData);
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

        issuesChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labelsIssues1,
            datasets: [{
                label: 'num of Created Issues',
                data: createdIssue,
                backgroundColor: [
                  'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                  'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1,
                lineTension: 0
              },
              {
                label: 'num of Closed Issues',
                data: closedIssue,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                  'rgba(255,99,132,1)'
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
      complete: function (data) {
           $("#issuesSpinner").css('display', 'none');
         },
      error: function(error) {
        console.log(error);
      }
    });
  });
});
