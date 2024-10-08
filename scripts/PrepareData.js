var quota_data;
var interview_data;
var today_flight_list;
var this_month_flight_list;
var daily_plan_data;
var removed_ids_data;

var currentDate; //dd-mm-yyyy
var currentYear;
var currentMonth; //mm
var currentQuarter; //1, 2, 3, 4
var nextDate; //dd-mm-yyyy

var download_time;

var total_completed;
var total_completed_percent;
var total_quota_completed;
var total_hard_quota;
var total_quota;
var total_over_quota = 0;
var Jan_2024_cut_off_day = 21;
/************************************/
function clean_data ()
{
  for (i = 0; i<interview_data.length; i++ )
  {
    //if (interview_data[i].InterviewEndDate.substring(3,10) == "10-2023") 
    {
      if ( interview_data[i].quota_id.toLowerCase() == "ek-dubai") interview_data[i].quota_id = "EK-DXB"; 
      if ( interview_data[i].quota_id.toLowerCase() == "qr-dia") interview_data[i].quota_id = "QR-DOH"; 
      if ( interview_data[i].quota_id.toLowerCase() == "qr-dia") interview_data[i].quota_id = "QR-DOH"; 
      if ( interview_data[i].quota_id.toLowerCase() == "qr-doha") interview_data[i].quota_id = "QR-DOH";       
      if ( interview_data[i].quota_id.toLowerCase() == "q4-doh") interview_data[i].quota_id = "QR-DOH";       
      if ( interview_data[i].quota_id.toLowerCase() == "q4-doha") interview_data[i].quota_id = "QR-DOH";       
      if ( interview_data[i].quota_id.toLowerCase() == "q4-doha") interview_data[i].quota_id = "QR-DOH";       
      if ( interview_data[i].quota_id.toLowerCase() == "qr-dxb") interview_data[i].quota_id = "QR-DOH";       
       
      interview_data[i].quota_id = interview_data[i].quota_id.replace("Bombay","BOM");
      interview_data[i].quota_id = interview_data[i].quota_id.replace("Mumbai","BOM");
      interview_data[i].quota_id = interview_data[i].quota_id.replace("Mumba","BOM");
      
      interview_data[i].quota_id = interview_data[i].quota_id.replace("Abudabi","AUH");
      interview_data[i].quota_id = interview_data[i].quota_id.replace("AbuDabi","AUH");
      interview_data[i].quota_id = interview_data[i].quota_id.replace("Abudhabi","AUH");

      interview_data[i].quota_id = interview_data[i].quota_id.replace("Bahrain","BAH");

      interview_data[i].quota_id = interview_data[i].quota_id.replace("Dubai","DXB");
      
      
      interview_data[i].quota_id = interview_data[i].quota_id.replace("Singapore","SIN");

      interview_data[i].quota_id = interview_data[i].quota_id.replace("Colombo","CMB");

      interview_data[i].quota_id = interview_data[i].quota_id.replace("Malaysia","KUL");
      
    }  

  }
}
function initCurrentTimeVars() {
  var today = new Date();

  var day = '' + today.getDate();
  var month = '' + (today.getMonth() + 1); //month start from 0;
  var year = today.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  currentDate = [day, month, year].join('-');
  currentYear = year;
  currentMonth = month; //[month, year].join('-');;
  currentQuarter = getQuarterFromMonth(currentMonth, currentYear);

  //////////
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate()+1);
  var tomorrowMonth = '' + (tomorrow.getMonth() + 1); //month start from 0;
  var tomorrowDay = '' + tomorrow.getDate();
  var tomorrowYear = tomorrow.getFullYear();

  if (tomorrowMonth.length < 2) tomorrowMonth = '0' + tomorrowMonth;
  if (tomorrowDay.length < 2) tomorrowDay = '0' + tomorrowDay;

  nextDate  = [tomorrowDay, tomorrowMonth, tomorrowYear].join('-');

    //special patch for Nov: 01-05 Nov calcuated as Oct    
    if ((year == 2024) && (month == '01') &&  (day <= Jan_2024_cut_off_day))
    {
      currentQuarter = "2023-Q4";
    } 
  
    
  //////////
  if (document.getElementById('year_month') && document.getElementById('year_month').value.length > 0)
  {
    if (document.getElementById('year_month').value != "current-quarter")
    {
      currentQuarter = document.getElementById('year_month').value;
    }
  }
 
  switch(currentQuarter) {
    case "2023-Q4":
      total_quota = 1600;
      break;      
    case "2024-Q1":
      total_quota = 1600;
      break;
    case "2024-Q4":
      total_quota = 1600 ;
      break;
    default:
      total_quota = 1600 ;
      break;
  }

}

function getQuarterFromMonth(month, year)
{
  //Input: mm, yyyy
  var quarter = 0;
  
  if ((month == '01') || (month == '02') || (month == '03')) {
    quarter = "Q1";  
  }
  else if ((month == '04') || (month == '05') || (month == '06')) {
    quarter = "Q2";  
  }
  else if ((month == '07') || (month == '08') || (month == '09') || (month == '10') ) {
    quarter = "Q3";  
  }
  else if ( (month == '11') || (month == '12')) { //(month == '10') ||
    quarter = "Q4";  
  }
  return (year + "-" + quarter);
}

function notDeparted(flight_time) {
  var current_time = new Date().toLocaleString('en-US', { timeZone: 'Indian/Maldives', hour12: false});
  //15:13:27
  var current_time_value  = current_time.substring(current_time.length-8,current_time.length-6) * 60;
  current_time_value += current_time.substring(current_time.length-5,current_time.length-3)*1;

  //Time: 0805    
  var flight_time_value = flight_time.substring(0,2) * 60 + flight_time.substring(2,4)*1;
  var result = (flight_time_value + 120 > current_time_value);
  return (result);
}

function isvalid_id(id)
{
  valid = true;

  var i = 0;
  for (i = 0; i < removed_ids_data.length; i++) 
  { 
    if (removed_ids_data[i].removed_id == id)
    {
      valid = false;
    }
  }
  return valid;
}

function prepareInterviewData() {
  var quota_data_temp = JSON.parse(quota_info);
  var interview_data_full  = JSON.parse(interview_statistics);
  var flight_list_full  = JSON.parse(MLE_Departures_Flight_List_Raw);

  initCurrentTimeVars();		
  
  //get quota data
  quota_data = [];
  quota_data.length = 0;
  for (i = 0; i < quota_data_temp.length; i++) {
    if ((quota_data_temp[i].Quota>0)
         && (quota_data_temp[i].Quarter == currentQuarter))
    {
      quota_data.push(quota_data_temp[i]);
    }
  }
  
  //get relevant interview data
  //empty the list
  interview_data = [];
  interview_data.length = 0;

  download_time = interview_data_full[0].download_time;
  for (i = 0; i < interview_data_full.length; i++) {
    var interview = interview_data_full[i];

    var interview_year = interview["InterviewDate"].substring(0,4);
    var interview_month = interview["InterviewDate"].substring(5,7);//"2023-04-01",
    var interview_quarter = getQuarterFromMonth(interview_month, interview_year);

    //MLE: get all
    //if (currentQuarter == interview_quarter)
    {
      if (interview["quota_id"]) {
        var quota_id = '"quota_id"' + ":" + '"' +  interview["quota_id"] + '", ';
        var InterviewEndDate = '"InterviewEndDate"' + ":" + '"' +  interview["InterviewDate"] + '", ';
        var Completed_of_interviews = '"Completed_of_interviews"' + ":" + '"' +  interview["Number of interviews"] ;
        
        quota_id = quota_id.replace(" ", "");
        var str = '{' + quota_id + InterviewEndDate + Completed_of_interviews + '"}';

        interview_data.push(JSON.parse(str));
       }
    }
  }
  clean_data();

  //prepare flight list
  //empty the list
  today_flight_list = [];
  today_flight_list.length = 0;
  
  this_month_flight_list  = []; //for DOOP
  this_month_flight_list.length = 0;
  
  for (i = 0; i < flight_list_full.length; i++) {
    let flight = flight_list_full[i];

    //airport_airline
    flight.Flight = flight.Flight.replace(" ", "");
    flight.quota_id = flight.AirlineCode + "-" + flight.Dest;//code for compare

    //currentQuarter: 02-2023
    //flight.Date: 08-02-2023
    this_month_flight_list.push(flight);

    var d = new Date();
    var currentDayOfWeek = d.getDay();
    var today = getToDate();

    //only get today & not departed flight
    if (
        (today <= flight.Effective_end)
        && (today >= flight.Effective_start)
        && (currentDayOfWeek == flight.day_of_week)
        && notDeparted(flight.Time)
        )
    { 
      today_flight_list.push(flight);
    }
  }
 
  //add quota data
  daily_plan_data = [];
  daily_plan_data.length = 0;
  
  for (i = 0; i < today_flight_list.length; i++) {
    let flight = today_flight_list[i];

    for (j = 0; j < quota_data.length; j++) {
      let quota = quota_data[j];

      if ((quota.quota_id == flight.quota_id))
      {
        if (quota.Quota>0) {
          flight.Quota = quota.Quota;
          daily_plan_data.push(flight);
        }
       }
    }
  }
   console.log("today_flight_list: ", today_flight_list);
   //console.log("quota_data: ", quota_data);
   console.log("daily_plan_data: ", daily_plan_data);
}
