$(function() {
  let commmit_chart = null;
  let stats_chart = null;
  let work_profile = null;
  let avatar = null;
  let startDay = moment().startOf('month').format('YYYY-MM-DD');
  let lastDay = moment().format('YYYY-MM-DD')
  colors = ['#0e6251', '#117864', '#148f77', '#17a589', '#1abc9c', '#48c9b0', '#76d7c4', '#a3e4d7', '#d1f2eb',
    '#fef5e7', '#fdebd0', '#fad7a0', '#f8c471', '#f5b041', '#f39c12', '#d68910', '#b9770e', '#9c640c', '#7e5109'
  ]
  colorStone = ['#0B3B1F', '#1DAC4B', '#380713', '#74121D', '#C52233', '#595708', '#657212', '#ABC421']


  $('#name').autoComplete({
      minChars: 1,cache: false, delay : 20,
      source: function(term, response) {
      $('.autocomplete-suggestion').show();
       $.getJSON('/get_user_login?name=' + term, function(result) {
          let returnedData = result.map(function(num) {
            return num.login;
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
    if ($("#userRangeDate").val()) {
      startDay = JSON.parse($("#userRangeDate").val()).start;
      lastDay = JSON.parse($("#userRangeDate").val()).end;
    }
    $.ajax({
      url: '/get_avatar?login=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let url = String(returnedData[0]['avatarUrl']);
        let username = String(returnedData[0]['login']);
        let following = String(returnedData[0]['following']);
        let followers = String(returnedData[0]['followers']);
        let orgLastUpdated = String(returnedData[0]['db_last_updated']);
        let responseCode = String(returnedData[0]['response']);
        $('#avatar').attr("src", url);
        $('#username').text(username);
        $('#followers').text(followers);
        $('#following').text(following);
        $('#orgLastUpdated').html('<i class="fa fa-clock-o"></i> '+ orgLastUpdated + ' minutes ago');
        if (responseCode == 404){
          $(".content").hide();
          $(document).ready(function() {
        		$.notify({
        			icon: 'pe-7s-close-circle',
        			message: "User does not exist"
        		}, {
        			type: 'danger',
        			timer: 4000
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
      url: '/get_user_commit?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        let labelsCommit = returnedData.map(function(num) {
          return num.day;
        });
        let dataCommits = returnedData.map(function(num) {
          return num.count;
        });
        let ctx = document.getElementById("commmit_chart").getContext('2d');
        if (commmit_chart != null) {
          commmit_chart.destroy();
        }
        commmit_chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labelsCommit,
            datasets: [{
              label: 'num of Commits',
              data: dataCommits,
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
      }
    });
    $.ajax({
      url: '/get_user_contributed_repo?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        $("#contributed_repo").empty();
        returnedData.map(function(num) {
          repoName = num.repoName;
          org = num.org;
           html =   `<tr class="elements-list" onclick="window.location='/repos?org=${org}&name=${repoName}';" style="cursor: pointer;">
                        <td style="width:10px;">
                                <i class="pe-7s-angle-right-circle"></i>
                        </td>
                        <td>${repoName}

                        </td>
                        <td class="td-actions text-right">
                        <span class="label label-success">${org}</span>
                        </td>
                    </tr>`
          $("#contributed_repo").append(html);
        });
      },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/get_user_team?name=' + name,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        $("#user_teams").empty();
        returnedData.map(function(num) {
          teamName = num.teamName;
          org = num.org;
          slug = num.slug;
          html =   `<tr class="elements-list" onclick="window.location='/teams?org=${org}&name=${slug}';" style="cursor: pointer;">
                        <td style="width:10px;">
                                <i class="pe-7s-angle-right-circle"></i>
                        </td>
                        <td>${teamName}

                        </td>
                        <td class="td-actions text-right">
                        <span class="label label-success">${org}</span>
                        </td>
                    </tr>`
          $("#user_teams").append(html);
        });
      },
      error: function(error) {
        console.log(error);
      }
    });
    $.ajax({
      url: '/get_user_stats?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay,
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
        let ctx = document.getElementById("stats_chart").getContext('2d');
        if (stats_chart != null) {
          stats_chart.destroy();
        }
        stats_chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labelsIssues1,
            datasets: [{
                label: 'num of Additions',
                data: dataIssues1,
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
                label: 'num of Deletions',
                data: dataIssues2,
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
                  suggestedMax: 10,
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
    $.ajax({
      url: '/get_user_new_work?name=' + name + '&startDate=' + startDay + '&endDate=' + lastDay,
      type: 'GET',
      success: function(response) {
        returnedData = JSON.parse(response);
        if (work_profile != null) {
      work_profile.destroy();
    }
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
            label: labelNames,
			borderColor: '#17a589',
			backgroundColor: '#17a589',
			pointRadius: 9,
			pointHoverRadius: 8,
            data: data
        }
     ]
    },
    options: {
    tooltips: {
              mode: 'index',
              intersect: true,
			  callbacks: {
                title: function(tooltipItem, data) {
                  return info[tooltipItem[0]['index']]['author'];
                },
                beforeLabel: function(tooltipItem, data) {
                  return 'Total commits: '+ info[tooltipItem['index']]['commits'];
                },
                label: function(tooltipItem, data) {
                  return 'Total additions: '+ info[tooltipItem['index']]['additions'];
                },
                afterLabel: function(tooltipItem, data) {
                  return 'Total deletions: ' + info[tooltipItem['index']]['deletions'];
                },
              },
            },
    layout :{
    padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
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
      error: function(error) {
        console.log(error);
      }
    });

      $(".content").show();
  });
  if ($("#name").data("myval") != 'None'){
    let name = $("#name").data("myval");
    $("#name").val(name);
    $('#find').click();
   };
});
