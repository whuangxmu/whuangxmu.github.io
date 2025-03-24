function Syllabus() {
    var obj = new Object;

    const formatter = new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        weekday: 'long'
    });

    obj.scheduleCourses = function (classDates, courses) {
        var field = "";
        var x = 0;
        // 遍历课程
        courses.forEach(course => {
            let currentDateIndex = 0;
            let currentDateCapacity = 0;
            // 如果当前日期的容量不足以容纳当前课程，则拆分成多个部分，跨多个日期
            var part = 1;
            if (course.type === 1)
                field = "tclasslast";
            else if (course.type === 2)
                field = "eclasslast";
            while (course.classlast > 0 && currentDateIndex < classDates.length) {
                if ((course.type === 1 && classDates[currentDateIndex].tclasslast === 0) || (course.type === 2 && classDates[currentDateIndex].eclasslast === 0)) {
                    currentDateIndex++;
                    continue;
                }
                // console.log(classDates[currentDateIndex].date+": T: "+classDates[currentDateIndex].tclasslast+"; E: "+classDates[currentDateIndex].eclasslast);
                const remainingClass = Math.min(classDates[currentDateIndex][field] - currentDateCapacity, course.classlast);
                if (typeof classDates[currentDateIndex].content === 'undefined') {
                    classDates[currentDateIndex].content = [];
                }
                course.classlast -= remainingClass;
                var part_suffix = "";
                if (course.classlast !== 0 || part !== 1) {
                    part_suffix = " (" + part + ")";
                }
                classDates[currentDateIndex].content.push({
                    type: course.type,
                    title: course.title + part_suffix,
                    lecture: course.lecture,
                    chapter: course.chapter,
                    classlast: remainingClass
                });
                classDates[currentDateIndex][field] -= remainingClass;
                if (classDates[currentDateIndex][field] === 0) {
                    currentDateIndex++;
                }
                part++;
            }
        });

        return classDates;
    }

    function getWeekNumber(date, firstSunday) {
        // 确保两个日期都是Date对象  
        if (!(date instanceof Date) || !(firstSunday instanceof Date)) {
            throw new TypeError('Both arguments must be Date objects');
        }
        const daysDiff = Math.floor((date - firstSunday) / (1000 * 60 * 60 * 24));
        const weeksDiff = Math.floor(daysDiff / 7) + 1;
        return weeksDiff;
    }

    obj.generateClassDates = function (firstSunday, lastSaturday, theoryDays, labDays, holidays, type) {
        // 生成一个包含指定天数（从start开始，不包括end）的日期数组  
        function generateDates(start, end) {
            let dates = [];
            let current = new Date(start);
            while (current < end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            return dates;
        }

        // 将日期转换为周中的天数（0=周日, 1=周一, ..., 6=周六）  
        function getDayOfWeek(date) {
            return date.getDay();
        }

        // 解析输入日期  
        const startDate = new Date(firstSunday);
        const endDate = new Date(lastSaturday);

        let weekParity = 0;
        if (labDays < 0) {
            weekParity = 1;
            labDays = -labDays;
        }

        // 生成整个学期的日期数组
        const allDates = generateDates(startDate, endDate.setDate(endDate.getDate() + 1) && new Date(endDate)); // 包括最后一周的周六  
        // 创建一个空数组来存储最终的上课日期和类型  
        const classDates = [];
        // 遍历整个学期的日期  
        for (let date of allDates) {
            const dayOfWeek = getDayOfWeek(date);
            const holidayIndex = holidays[0].findIndex(holiday => (holiday.getFullYear() === date.getFullYear() &&
                holiday.getMonth() === date.getMonth() &&
                holiday.getDate() === date.getDate()));
            // 检查是否是理论课且不是节假日  
            let th = (theoryDays.includes(dayOfWeek) &&
                (type == 1 || (type == 2 && !(labDays == dayOfWeek && getWeekNumber(date, firstSunday) % 2 == weekParity)))) ? 2 : 0;
            let lb = (labDays == dayOfWeek &&
                (type == 1 || (type == 2 && getWeekNumber(date, firstSunday) % 2 == weekParity))) ? 2 : 0;
            if (holidayIndex < 0) {
                classDates.push({date, tclasslast: th, eclasslast: lb});
            } else if (holidays[1][holidayIndex]) {
                date = holidays[1][holidayIndex];
                classDates.push({date, tclasslast: th, eclasslast: lb});
            }
        }
        classDates.sort((a, b) => a.date - b.date);
        // 将日期转换为字符串格式返回
        return classDates;
    }

    obj.buildTable = function (classDates) {
        let currentRow = null;
        let currentType = null;
        let currentDate = null;
        let isNew = true;
        let table = "";
        var sameOrder = false;

        classDates.forEach(date => {
            //console.log(date.content +","+date.content == undefined);
            if (date.content == undefined || !Array.isArray(date.content) || date.content.length == 0)
                return;

            if (isNew) {
                table += `<table class="table table-bordered table-striped table-hover"><thead><tr>`;
                sameOrder = (date.content[0].lecture === undefined);
                if (sameOrder)
                    table += `<th width="15%">类型</th><th width="10%">章次</th><th width="37%">主要内容</th><th width="8%">课时</th><th width="30%">日期</th>`;
                else
                    table += `<th width="10%">类型</th><th width="10%">课件序号</th><th width="37%">主要内容</th><th width="10%">课本章</th><th width="8%">课时</th><th width="25%">日期</th>`;
                table += `</tr></thead><tbody>`;
                isNew = false;
            }

            let year = date.date.getFullYear();
            let month = String(date.date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要+1  
            let day = String(date.date.getDate()).padStart(2, '0');
            date.content.forEach((course, index) => {
                // 开始新行  
                table += `<tr id="${year}${month}${day}_${index}">`;
                // 使用 Intl.DateTimeFormat 分别获取年、月、日和星期几  
                const yearFormatter = new Intl.DateTimeFormat('zh-CN', {year: 'numeric'});
                const monthFormatter = new Intl.DateTimeFormat('zh-CN', {month: '2-digit'});
                const dayFormatter = new Intl.DateTimeFormat('zh-CN', {day: '2-digit'});
                const weekdayFormatter = new Intl.DateTimeFormat('zh-CN', {weekday: 'long'});

                // 格式化并拼接字符串  
                syear = yearFormatter.format(date.date);
                smonth = monthFormatter.format(date.date).padStart(2, '0'); // 确保月份是两位数  
                sday = dayFormatter.format(date.date).padStart(2, '0'); // 确保日期是两位数  
                sweekday = weekdayFormatter.format(date.date); // 修改星期几的格式  

                // 拼接成最终的日期字符串  
                let classDateStr = `${syear}${smonth}${sday} (${sweekday})`;
                if (currentType !== course.type || currentDate !== date.date) {
                    let rowspan = date.content.filter(c => c.type === course.type).length;
                    table += `<td class="text-center" rowspan="${rowspan}">${course.type === 1 ? '理论课' : '实验课'}</td>`;
                }
                if (sameOrder) {
                    table += `<td class="text-center">${course.chapter || ''}</td>`;
                    table += `<td class="text-justify">${course.title}</td>`
                } else {
                    table += `<td class="text-center">${course.lecture || ''}</td>`;
                    table += `<td class="text-justify">${course.title}</td>`
                    table += `<td class="text-center">${course.chapter || ''}</td>`;
                }
                table += `<td class="text-center">${course.classlast}</td>`
                if (currentDate !== date.date) {
                    table += `<td class="text-center" rowspan="${date.content.length}">${classDateStr}</td>`;
                }
                table += `</tr>`;

                let dateString = `${year}${month}${day}`;
                if (course.type === 1)
                    $("#" + dateString).append(`<a class="text-info" href="#${dateString}_${index}" style="margin: 2px; font-size: 16pt"><i class="glyphicon glyphicon-comment"></i></a>`);
                else if (course.type === 2)
                    $("#" + dateString).append(`<a class="text-warning" href="#${dateString}_${index}" style="margin: 2px; font-size: 16pt"><i class="glyphicon glyphicon-comment"></i></a>`);
                currentType = course.type;
                currentDate = date.date;
            });
        });
        table += '</tbody></table>';
        return table;
    }

    //生成HTML的函数  
    obj.generateCalendar = function (firstSunday, lastSaturday) {
        let html = '<table class="table table-bordered table-striped table-hover"><thead><tr><th>周次</th><th>月份</th><th>周日</th><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th><th>周六</th></tr></thead><tbody>';
        let currentDate = new Date(firstSunday);
        let weekNumber = 0;
        let monthHeader = '';
        while (currentDate <= lastSaturday) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate();
            let syear = currentDate.getFullYear();
            let smonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要+1  
            let sday = String(currentDate.getDate()).padStart(2, '0');

            let new_month = currentDate.getDate() == 1;
            let new_table = (currentDate.getFullYear() == firstSunday.getFullYear() && currentDate.getMonth() == firstSunday.getMonth() && currentDate.getDate() == firstSunday.getDate());
            let new_week = (currentDate.getDay() == 0);

            if (new_week) {
                weekNumber++;
            }
            if (new_month || new_table) {
                if (!new_table) {
                    for (var i = (currentDate.getDay() + 6) % 7 + 1; i < 7; i++) {
                        html += `<td></td>`;
                    }
                    html += `</tr>`;
                }
                html += `<tr><td class="text-center">${weekNumber}</td>`;
                html += `<td class="text-center" rowspan="${getWeeksInMonth(year, month, day)}">${month}</td>`;
                for (var i = 0; i < currentDate.getDay(); i++) {
                    html += "<td></td>";
                }
            } else if (new_week) {
                html += `<tr><td class="text-center">${weekNumber}</td>`;
            }
            // 添加日期  
            html += `<td class="text-center" id="${syear}${smonth}${sday}"><div>${day}</div></td>`;

            // 检查是否需要结束当前行  
            if (currentDate.getDay() === 6) {
                html += '</tr>';
            }

            // 移动到下一天  
            currentDate.setDate(currentDate.getDate() + 1);
        }

        html += '</tbody></table>';
        return html;
    }

    //辅助函数：获取某月天数  
    function getWeeksInMonth(year, month, day = 1) {
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year, month, 0);
        const startDayOfWeek = startDate.getDay();
        const endDayOfMonth = endDate.getDate();
        const daysRemaining = endDayOfMonth - day + 1;
        return Math.ceil((startDayOfWeek + daysRemaining) / 7);
    }

    obj.highlightToday = function () {
        let i;
        var today = new Date();
        var todayId = today.getFullYear() + (today.getMonth() + 1).toString().padStart(2, '0') + today.getDate().toString().padStart(2, '0');
        $("#" + todayId).addClass("bg-success text-success");
        var nextClass = null;
        for (i = 0; i < classDates.length; i++) {
            var classDate = classDates[i];
            if (classDate.date > today && classDate.content && classDate.content.length > 0) {
                nextClass = classDate.date.getFullYear() + (classDate.date.getMonth() + 1).toString().padStart(2, '0') + classDate.date.getDate().toString().padStart(2, '0');
                break;
            }
        }
        if (nextClass) {
            for (i = 0; i < 5; i++) {
                $("#" + nextClass+ "_" + i + " td").addClass("bg-info text-info");
            }
        }
    }

    return obj;
}