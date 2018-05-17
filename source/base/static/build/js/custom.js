/**
 * Resize function without multiple trigger
 * 
 * Usage:
 * $(window).smartresize(function(){  
 *     // code here
 * });
 */

/**
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CURRENT_URL = window.location.href.split('#')[0].split('?')[0],
    $BODY = $('body'),
    $MENU_TOGGLE = $('#menu_toggle'),
    $SIDEBAR_MENU = $('#sidebar-menu'),
    $SIDEBAR_FOOTER = $('.sidebar-footer'),
    $LEFT_COL = $('.left_col'),
    $RIGHT_COL = $('.right_col'),
    $NAV_MENU = $('.nav_menu'),
    $FOOTER = $('footer')
    startDate = moment().subtract(29, 'days').format('YYYY-MM-DD'),
    endDate = moment().format('YYYY-MM-DD');
    nameToFind = null;




// Panel toolbox
$(document).ready(function() {
    $('.collapse-link').on('click', function() {
        var $BOX_PANEL = $(this).closest('.x_panel'),
            $ICON = $(this).find('i'),
            $BOX_CONTENT = $BOX_PANEL.find('.x_content');

        // fix for some div with hardcoded fix class
        if ($BOX_PANEL.attr('style')) {
            $BOX_CONTENT.slideToggle(200, function(){
                $BOX_PANEL.removeAttr('style');
            });
        } else {
            $BOX_CONTENT.slideToggle(200);
            $BOX_PANEL.css('height', 'auto');
        }

        $ICON.toggleClass('fa-chevron-up fa-chevron-down');
    });

    $('.close-link').click(function () {
        var $BOX_PANEL = $(this).closest('.x_panel');

        $BOX_PANEL.remove();
    });
});
// /Panel toolbox










	function ajaxCall(callback, path, parameters){
        parameter = `${parameters.join("&")}`;
        url = `/${path}?${parameter}`;
	    $.ajax({
              url: url,
              type: 'GET',
              success: function(response) {
                    callback(JSON.parse(response));
              }
	    })
	}

	function startData(startDate, endDate, name){
	    switch(page){
	        case 'org':
	            console.log(startDate);
	            console.log(endDate);
	            startOrganization($('#orgNames').val(), startDate, endDate);
	            break;
	        case 'profile':
	            console.log(startDate);
	            console.log(endDate);
	            console.log(name);
	            startProfile(startDate, endDate, name);
	            break;
	    }
	}



	function startOrganization(organization, startDate, endDate){
	        if(document.getElementById("main-row").style.visibility === "hidden"){
	        document.getElementById("main-row").style.visibility = "visible";
	        }
            init_line_chart(organization, startDate, endDate, 'org_commits', 'orgCommitsChart');
            init_double_line_chart(organization, startDate, endDate, 'org_issues', 'orgIssuesChart');
            OrganizationHeaderInfo(organization, startDate, endDate);
            init_org_last_commit(organization);
            init_org_languages_chart(organization, startDate, endDate);
            init_pie_chart(organization, 'org_readme', "readmeChart",
             "readmeChartData");
            init_pie_chart(organization, 'org_open_source_readme_languages', "openSourceReadmeLanguages",
             "openSourceReadmeLanguagesData");
             init_pie_chart(organization, 'org_open_source', "openSourceChart",
             "openSourceChartData");
			}

	function startProfile(startDate, endDate, name){
            userHeaderInfo(name);
            init_user_last_commit(name);
            userScatterBox(name, startDate, endDate);
//            init_commits_chart(name, startDate, endDate);
            user_worked_repository(name, startDate, endDate);
            init_line_chart(name, startDate, endDate, 'user_commits', 'orgCommitsChart')
	}

    function OrganizationHeaderInfo(organization, startDate, endDate){
        response = ajaxCall(callback, 'proxy/org_header_info', [`name=${organization}`, `startDate=${startDate}`, `endDate=${endDate}`]);
        function callback(response){
            let users = response["users"];
            let teams = response["teams"];
            console.log(teams);
            let repositories = response["repositories"];
            let avgCommits = response["avgCommits"];
            console.log(users);
            $( "#usersCount" ).html( users );
            $( "#teamsCount" ).html( teams );
            $( "#repositoriesCount" ).html( repositories );
            $( "#AvCommitsCount" ).html( avgCommits );
        }
    }

    /* USER LAST COMMITS */

        function init_user_last_commit(name){
            $("#user-last-commits").empty();
            response = ajaxCall(callback, 'proxy/user_last_commit', [`name=${name}`]);
            function callback(response){
                response.map(function(num, index) {
                console.log(index);
                    html =   `<li>
                                  <img src=${document.getElementById( 'avatar' ).src} class="avatar" alt="Avatar">
                                  <div class="message_date">
                                    <h3 class="date text-info">${num.day}</h3>
                                    <p class="month">${num.month}</p>
                                  </div>
                                  <div class="message_wrapper">
                                    <h4 class="heading">${num.repo_name}</h4>
                                    <blockquote class="message">${num.message_head_line}</blockquote>
                                    <br />
                                    <p class="url">
                                      <span class="fs1 text-info" aria-hidden="true" data-icon=""></span>
                                      <i class="fa fa-calendar"></i> ${num.committed_date}
                                    </p>
                                  </div>
                                </li>`
                    $("#user-last-commits").append(html);
                });
            }
        }

    function init_line_chart(name, startDate, endDate, path, chartId){
            response = ajaxCall(callback, `proxy/${path}`, [`name=${name}`, `startDate=${startDate}`, `endDate=${endDate}`]);
            function callback(response){
                let myChart = echarts.init(document.getElementById(chartId));
                let date = response.map(function(num) {return num.day;});
                let data = response.map(function(num) {return num.count;});
                option = {
                    tooltip: {
                        trigger: 'axis',
                        position: function (pt) {
                            return [pt[0], '10%'];
                        }
                    },
                    toolbox: {
                          show: true,
                          feature: {
                            dataZoom : {
                                show : false,
                                title : {
                                    dataZoom : 'dataZoom',
                                    dataZoomReset : 'dataZoomReset'
                                }
                            },
                            dataView : {
                                show : true,
                                title : 'dataView',
                                readOnly: true,
                                lang: ['', 'close']
                            },
                            restore: {
                              show: true,
                              title: "Restore"
                            },
                            saveAsImage: {
                              show: true,
                              title: "Save Image"
                            }
                          }
                        },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: date
                    },
                    yAxis: {
                        type: 'value',
                        boundaryGap: [0, '0%']
                    },
                    grid: {
                        top:    10,
                        bottom: 60,
                        left:   50,
                        right:  50,
                      },
                    splitLine: {
                      show: false,
                      lineStyle: {
                            color: ['#ccc'],
                            width: 1,
                            type: 'solid'
                        },
                    },
                    axisLine: {
                      show: false,
                      lineStyle: {
                            color: ['#ccc'],
                            width: 1,
                            type: 'solid'
                        },
                    },
                    dataZoom: [{
                        type: 'inside',
                        start: 0,
                        end: 100
                    }, {
                        start: 0,
                        end: 10,
                        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                        handleSize: '80%',
                        handleStyle: {
                            color: '#fff',
                            shadowBlur: 3,
                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        }
                    }],
                    series: [
                        {
                            name:'Commits',
                            type:'line',
                            smooth:false,
                            symbol: 'none',
                            sampling: 'average',
                            itemStyle: {
                                normal: {
                                    color: 'rgb(26, 187, 90)'
                                }
                            },
                            areaStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                        offset: 1,
                                        color: 'rgb(46, 187, 156)'
                                    }, {
                                        offset: 0,
                                        color: 'rgb(26, 187, 90)'
                                    }])
                                }
                            },
                            data: data,
                             markLine : {
                                data : [
                                    {type : 'average', name: 'average'}
                                ]
                            }
                        }
                    ]
                };
            myChart.setOption(option);
            }
        }



    function init_org_languages_chart(name, startDate, endDate){
            response = ajaxCall(callback, 'proxy/org_languages', [`name=${name}`]);
            function callback(response){
                let myChart = echarts.init(document.getElementById('orgLanguagesChart'));
                let count = response.map(function(num) {return num.count;});
                let languages = response.map(function(num) {return num.languages;});
                option = {
                    title : {
                        text: 'Languages',
                        subtext: ''
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    legend: {
                        data:['','']
                    },
                    toolbox: {
                        show : true,
                        feature : {
                            dataView : {show: true, readOnly: false},
                            magicType : {show: true, type: ['line', 'bar']},
                            restore : {show: true},
                            saveAsImage : {show: true}
                        }
                    },
                    calculable : true,
                    xAxis : [
                        {
                            type : 'category',
                            data : languages
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value'
                        }
                    ],
                    series : [
                        {
                            name:'%',
                            type:'bar',
                            data: count,
//                             color: ['blue','red','#e69d87','#8dc1a9','#ea7e53','#eedd78','#73a373','#73b9bc','#7289ab', '#91ca8c','#f49f42', '#73b9bc'],
                            itemStyle: {
                                normal: {
                                    color: function(params) {
                                        // build a color map as your need.
                                        var colorList = [
                                          '#C1232B','#B5C334','#FCCE10','#E87C25','#27727B',
                                           '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
                                           '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
                                        ];
                                        return colorList[params.dataIndex]
                                    },
                                }
                            },

                        }
                    ]
                };
            myChart.setOption(option);
            }
        }

    function init_double_line_chart(name, startDate, endDate, path, chartId){
            response = ajaxCall(callback, `proxy/${path}`, [`name=${name}`, `startDate=${startDate}`, `endDate=${endDate}`]);
            function callback(response){
                let myChart = echarts.init(document.getElementById(chartId));
                let date = response[0].map(function(num) {return num.day;});
                let data1 = response[0].map(function(num) {return num.count;});
                let data2 = response[1].map(function(num) {return num.count;});
                option = {
                    tooltip: {
                        trigger: 'axis',
                        position: function (pt) {
                            return [pt[0], '10%'];
                        }
                    },
                    toolbox: {
                          show: true,
                          feature: {
                            dataZoom : {
                                show : false,
                                title : {
                                    dataZoom : 'dataZoom',
                                    dataZoomReset : 'dataZoomReset'
                                }
                            },
                            dataView : {
                                show : true,
                                title : 'dataView',
                                readOnly: true,
                                lang: ['', 'close']
                            },
                            restore: {
                              show: true,
                              title: "Restore"
                            },
                            saveAsImage: {
                              show: true,
                              title: "Save Image"
                            }
                          }
                        },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: date
                    },
                    yAxis: {
                        type: 'value',
                        boundaryGap: [0, '10%']
                    },
                    grid: {
                        top:    10,
                        bottom: 60,
                        left:   50,
                        right:  50,
                      },
                    splitLine: {
                      show: false,
                      lineStyle: {
                            color: ['#ccc'],
                            width: 1,
                            type: 'solid'
                        },
                    },
                    axisLine: {
                      show: false,
                      lineStyle: {
                            color: ['#ccc'],
                            width: 1,
                            type: 'solid'
                        },
                    },
                    dataZoom: [{
                        type: 'inside',
                        start: 0,
                        end: 100
                    }, {
                        start: 0,
                        end: 10,
                        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                        handleSize: '80%',
                        handleStyle: {
                            color: '#fff',
                            shadowBlur: 3,
                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        }
                    }],
                    series: [
                        {
                            name:'Opened Issues',
                            type:'line',
                            smooth:false,
                            symbol: 'none',
                            sampling: 'average',
                            itemStyle: {
                                normal: {
                                    color: 'rgb(26, 187, 90)'
                                }
                            },
                            areaStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                        offset: 1,
                                        color: 'rgb(46, 187, 156)'
                                    }, {
                                        offset: 0,
                                        color: 'rgb(26, 187, 90)'
                                    }])
                                }
                            },
                            data: data2
                        },
                        {
                            name:'Closed Issues',
                            type:'line',
                            smooth:false,
                            symbol: 'none',
                            sampling: 'average',
                            itemStyle: {
                                normal: {
                                    color: 'rgb(211, 76, 60)'
                                }
                            },
                            areaStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                        offset: 1,
                                        color: 'rgb(231, 76, 60)'
                                    }, {
                                        offset: 0,
                                        color: 'rgb(211, 76, 30)'
                                    }])
                                }
                            },
                            data: data1
                        }
                    ]
                };
            myChart.setOption(option);
            }
        }


    function userHeaderInfo(name){
        response = ajaxCall(callback, 'proxy/user_avatar', [`login=${name}`]);
        function callback(response){
        console.log(response);
            let avatar = String(response[0]['avatar_url']);
            let login = String(response[0]['login']);
            let username = String(response[0]['dev_name']);
            $('#avatar').attr("src", avatar);
            $('#login').html(`${login}<small>Github Activity report</small>`);
            $('#githubUrl').html(`<i ><a href="https://github.com/${login}" class="fa fa-github user-profile-icon" target="_blank"></a>`);
            $('#username').text(`${login}`);
        }
    }

    function userScatterBox(name, startDate, endDate){
        response = ajaxCall(callback, 'proxy/user_new_work', [`name=${name}`, `startDate=${startDate}`, `endDate=${endDate}`]);
        function callback(response){
        console.log(response['data']);

            let myChart = echarts.init(document.getElementById('user-scatter-chart'));
            var data = [
               [44056,81.8,20,'Australia'], [
                -100,
                -90,
                500,
                "mralves"
              ]
            ];
            option = {
                title: {
                    text: 'New Work - Refactor - Commits scatter box',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                grid: {
                    top: 100,
                    bottom: 100
                },
                xAxis: {
                    min:-100,
                    max:100,
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                },
                yAxis: {
                    min:-100,
                    max:100,
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                },
                series: [{
                    name: '2015',
                    data: [response['data']],
                    type: 'scatter',
                    symbolSize: function (data) {
                        return Math.sqrt(data[2]) * 7;
//                            return 40;
                    },
                    label: {
                        emphasis: {
                            show: true,
                            formatter: function (param) {
                                return param.data[3];
                            },
                            position: 'top'
                        }
                    },
                    itemStyle: {
                        normal: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(25, 100, 150, 0.5)',
                            shadowOffsetY: 5,
                            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                                offset: 0,
                                color: 'rgb(129, 227, 238)'
                            }, {
                                offset: 1,
                                color: 'rgb(25, 183, 207)'
                            }])
                        }
                    }
                }]
            };
        myChart.setOption(option);
            }
        }




			
	    


	function init_pie_chart(organization, path, chartId, dataID){


		if( typeof (Chart) === 'undefined'){ return; }


		if ($(`#${chartId}`).length){

		    $(`#${dataID}`).empty();
            response = ajaxCall(callback, `proxy/${path}`, [`name=${organization}`]);
            function callback(response){
                console.log(chartId);
                let myChart = echarts.init(document.getElementById(`${chartId}`));
                let labels = response.map(function(num) {
                  return num.name;
                });
                let data = response.map(function(num) {
                  return num.value;
                });
                console.log("FOI");
                colors = ["#E74C3C","#26B99A","#3498DB"];
                response.map(function(num, index) {
                console.log(index);
                    html =   `<tr>
                              <td style="width:0px">
                                <p><i class="fa fa-square" style="color:${colors[index]}"></i>${num.name} </p>
                              </td>
                              <td>${num.value}%</td>
                            </tr>`
                    $(`#${dataID}`).append(html);
                });

                option = {
                    tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    calculable: true,
                    series: [
                    {
                        name:'language',
                        type:'pie',
                        radius: ['55%', '85%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '12',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: true
                            }
                        },
                        data:response
                    }
                    ]
                    };
                myChart.setOption(option);

            }
        }

	}


	   


	   
	   function init_variables(){
	        switch(page){
	            case 'profile':
	                autocompletePath = 'user_login';
	                break;
	            case 'org':
	                autocompletePath = null;
	                break;
	        }

	   }
	   /* AUTOCOMPLETE */
			
		function init_autocomplete() {
		$('#search-box').autocomplete({
		    paramName:'name',
            serviceUrl: `/proxy/${autocompletePath}`,
            onSelect: function (suggestion) {
                console.log(suggestion);
                if ($('#main-x-panel').attr('style')){
                     console.log("FOI");
                    $('.collapse-link').click();
                    }
                startData(startDate, endDate, suggestion['data']);
                nameToFind = suggestion['data'];
            }
        });

		};

		$('#find-button').click(function() {
			 if ($('#main-x-panel').attr('style')){
                     console.log("FOI");
                    $('.collapse-link').click();
                    }
              suggestion = $('#search-box').val();
              userHeaderInfo(suggestion);
                init_user_last_commit(suggestion);
                userScatterBox(suggestion, startDate, endDate);
                init_commits_chart('stone-payments', '2018-01-05', '2018-04-05');
			});




	   

	   



		



	   
	   
	   /* DATERANGEPICKER */
	   
		function init_daterangepicker() {

			if( typeof ($.fn.daterangepicker) === 'undefined'){ return; }
			console.log('init_daterangepicker');
		
			var cb = function(start, end, label) {
			  console.log(start.toISOString(), end.toISOString(), label);
			  $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
			};

			var optionSet1 = {
			  startDate: moment().subtract(29, 'days'),
			  endDate: moment(),
			  minDate: '01/01/2012',
			  maxDate: '12/31/2015',
			  dateLimit: {
				days: 60
			  },
			  showDropdowns: true,
			  showWeekNumbers: true,
			  timePicker: false,
			  timePickerIncrement: 1,
			  timePicker12Hour: true,
			  ranges: {
				'Today': [moment(), moment()],
				'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
				'Last 7 Days': [moment().subtract(6, 'days'), moment()],
				'Last 30 Days': [moment().subtract(29, 'days'), moment()],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
			  },
			  opens: 'left',
			  buttonClasses: ['btn btn-default'],
			  applyClass: 'btn-small btn-primary',
			  cancelClass: 'btn-small',
			  format: 'MM/DD/YYYY',
			  separator: ' to ',
			  locale: {
				applyLabel: 'Submit',
				cancelLabel: 'Clear',
				fromLabel: 'From',
				toLabel: 'To',
				customRangeLabel: 'Custom',
				daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
				monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
				firstDay: 1
			  }
			};
			
			$('#reportrange span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
			$('#reportrange').daterangepicker(optionSet1, cb);
			$('#reportrange').on('show.daterangepicker', function() {
			  console.log("show event fired");
			});
			$('#reportrange').on('hide.daterangepicker', function() {
			  console.log("hide event fired");
			});
			$('#reportrange').on('apply.daterangepicker', function(ev, picker) {
			  console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
              startDate = picker.startDate.format('YYYY-MM-DD');
              endDate = picker.endDate.format('YYYY-MM-DD');
              console.log($('search-box').val());
              startData(startDate, endDate, nameToFind);
			});
			$('#reportrange').on('cancel.daterangepicker', function(ev, picker) {
			  console.log("cancel event fired");
			});
			$('#options1').click(function() {
			  $('#reportrange').data('daterangepicker').setOptions(optionSet1, cb);
			});
			$('#options2').click(function() {
			  $('#reportrange').data('daterangepicker').setOptions(optionSet2, cb);
			});
			$('#destroy').click(function() {
			  $('#reportrange').data('daterangepicker').remove();
			});
   
		}
   	   
	   function init_daterangepicker_right() {
	      
				if( typeof ($.fn.daterangepicker) === 'undefined'){ return; }
				console.log('init_daterangepicker_right');
		  
				var cb = function(start, end, label) {
				  console.log(start.toISOString(), end.toISOString(), label);
				  $('#reportrange_right span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
				};

				var optionSet1 = {
				  startDate: moment().subtract(29, 'days'),
				  endDate: moment(),
				  maxDate: moment(),
				  showDropdowns: true,
				  showWeekNumbers: true,
				  timePicker: false,
				  timePickerIncrement: 1,
				  timePicker12Hour: true,
				  ranges: {
					'Today': [moment(), moment()],
					'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
					'Last 7 Days': [moment().subtract(6, 'days'), moment()],
					'Last 30 Days': [moment().subtract(29, 'days'), moment()],
					'This Month': [moment().startOf('month'), moment().endOf('month')],
					'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
				  },
				  opens: 'right',
				  buttonClasses: ['btn btn-default'],
				  applyClass: 'btn-small btn-primary',
				  cancelClass: 'btn-small',
				  format: 'MM/DD/YYYY',
				  separator: ' to ',
				  locale: {
					applyLabel: 'Submit',
					cancelLabel: 'Clear',
					fromLabel: 'From',
					toLabel: 'To',
					customRangeLabel: 'Custom',
					daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
					monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
					firstDay: 1
				  }
				};

				$('#reportrange_right span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

				$('#reportrange_right').daterangepicker(optionSet1, cb);

				$('#reportrange_right').on('show.daterangepicker', function() {
				  console.log("show event fired");
				});
				$('#reportrange_right').on('hide.daterangepicker', function() {
				  console.log("hide event fired");
				});
				$('#reportrange_right').on('apply.daterangepicker', function(ev, picker) {
				  startDate = picker.startDate.format('YYYY-MM-DD');
				  endDate = picker.endDate.format('YYYY-MM-DD');
				  startData(startDate, endDate, nameToFind);

				  console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
				});
				$('#reportrange_right').on('cancel.daterangepicker', function(ev, picker) {
				  console.log("cancel event fired");
				});

				$('#options1').click(function() {
				  $('#reportrange_right').data('daterangepicker').setOptions(optionSet1, cb);
				});

				$('#options2').click(function() {
				  $('#reportrange_right').data('daterangepicker').setOptions(optionSet2, cb);
				});

				$('#destroy').click(function() {
				  $('#reportrange_right').data('daterangepicker').remove();
				});

	   }
	   

		



	   
	  	/* PNotify */
			
		function init_PNotify() {
			
			if( typeof (PNotify) === 'undefined'){ return; }
			console.log('init_PNotify');
			
			new PNotify({
			  title: "PNotify",
			  type: "info",
			  text: "Welcome. Try hovering over me. You can click things behind me, because I'm non-blocking.",
			  nonblock: {
				  nonblock: true
			  },
			  addclass: 'dark',
			  styling: 'bootstrap3',
			  hide: false,
			  before_close: function(PNotify) {
				PNotify.update({
				  title: PNotify.options.title + " - Enjoy your Stay",
				  before_close: null
				});

				PNotify.queueRemove();

				return false;
			  }
			});

		}; 
	   
	   
	   /* CUSTOM NOTIFICATION */
			
		function init_CustomNotification() {
			
			console.log('run_customtabs');
			
			if( typeof (CustomTabs) === 'undefined'){ return; }
			console.log('init_CustomTabs');
			
			var cnt = 10;

			TabbedNotification = function(options) {
			  var message = "<div id='ntf" + cnt + "' class='text alert-" + options.type + "' style='display:none'><h2><i class='fa fa-bell'></i> " + options.title +
				"</h2><div class='close'><a href='javascript:;' class='notification_close'><i class='fa fa-close'></i></a></div><p>" + options.text + "</p></div>";

			  if (!document.getElementById('custom_notifications')) {
				alert('doesnt exists');
			  } else {
				$('#custom_notifications ul.notifications').append("<li><a id='ntlink" + cnt + "' class='alert-" + options.type + "' href='#ntf" + cnt + "'><i class='fa fa-bell animated shake'></i></a></li>");
				$('#custom_notifications #notif-group').append(message);
				cnt++;
				CustomTabs(options);
			  }
			};

			CustomTabs = function(options) {
			  $('.tabbed_notifications > div').hide();
			  $('.tabbed_notifications > div:first-of-type').show();
			  $('#custom_notifications').removeClass('dsp_none');
			  $('.notifications a').click(function(e) {
				e.preventDefault();
				var $this = $(this),
				  tabbed_notifications = '#' + $this.parents('.notifications').data('tabbed_notifications'),
				  others = $this.closest('li').siblings().children('a'),
				  target = $this.attr('href');
				others.removeClass('active');
				$this.addClass('active');
				$(tabbed_notifications).children('div').hide();
				$(target).show();
			  });
			};

			CustomTabs();

			var tabid = idname = '';

			$(document).on('click', '.notification_close', function(e) {
			  idname = $(this).parent().parent().attr("id");
			  tabid = idname.substr(-2);
			  $('#ntf' + tabid).remove();
			  $('#ntlink' + tabid).parent().remove();
			  $('.notifications a').first().addClass('active');
			  $('#notif-group div').first().css('display', 'block');
			});
			
		};

	   


        /* ORG NAMES */

        function init_chart_orgNames(){
            $("#orgNames").empty();
            response = ajaxCall(callback, 'proxy/org_names', []);


            function callback(response){
                response.map(function(name) {
                $('#orgNames')
                 .append($("<option></option>")
                 .attr("value",name.org)
                 .text(name.org));
            });
//

            }

        }

         /* ORG LAST COMMITS */

        function init_org_last_commit(name){
            $("#orgLastCommits").empty();
            response = ajaxCall(callback, 'proxy/org_last_commit', [`name=${name}`]);


            function callback(response){
                response.map(function(num, index) {
                console.log(index);
                    html =   `<li>
                                  <div class="block">
                                    <div class="block_content">
                                      <h2 class="title">
                                                        <a>${num.repo_name}</a>
                                                    </h2>
                                      <div class="byline"><span> on branch: ${num.branch_name}</span></div>
                                      <p class="excerpt">${num.message_head_line}
                                      </p>
                                      <div class="byline">
                                        <span>${num.committed_date}</span> by <a>${num.author} </a>
                                      </div>
                                    </div>
                                  </div>
                                </li>`
                    $("#orgLastCommits").append(html);
                });
            }

        }



        /* USER WORKED REPOSITORIES */

        function user_worked_repository(name, startDate, endDate){
            $("#user-worked-repositories").empty();
            response = ajaxCall(callback, 'proxy/user_worked_repository', [`name=${name}`, `startDate=${startDate}`, `endDate=${endDate}`]);


            function callback(response){
                response.map(function(n, index) {
                console.log(index);
                    html =   `<tr>
                                <td>${index+1}</td>
                                <td>${n.repo_name}</td>
                                <td class="vertical-align-mid">
                                  <div class="progress">
                                    <div class="progress-bar progress-bar-success" style="width:${n.value}%"></div>
                                  </div>
                                </td>
                                <td class="hidden-phone">${n.value}%</td>
                              </tr>`
                    $("#user-worked-repositories").append(html);
                });
            }
        }


	   
	   	/* CALENDAR */
		  


	$(document).ready(function() {
		init_variables();
		init_daterangepicker();
		init_daterangepicker_right();
//		init_CustomNotification();
		init_autocomplete();
        init_chart_orgNames();
        $('#orgNames').on('change', function() {
          startOrganization(this.value, startDate, endDate);
        })
	});
	

