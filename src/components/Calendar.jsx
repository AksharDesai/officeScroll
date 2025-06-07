import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

// Get the width of the device screen
const screenWidth = Dimensions.get('window').width;
// Calculate item width for 7 items per row with some spacing
const dayCellWidth = (screenWidth - 10 * 8) / 7; // 10 is padding/margin, 8 for 7 gaps + 2 side margins

// We give them default empty array values if no props are passed
const Calendar = ({presentDates=[],mobileDates=[]}) => {

    const currentDate = new Date()
    const [currentMonth,setCurrentMonth]=useState(currentDate.getMonth())// 0 for January, 11 for December
    const [currentYear,setCurrentYear]=useState(currentDate.getFullYear())//2025
    const [selectedDate,setSelectedDate]=useState(null)
    const ExamplepresentDates = ['2025-06-27','2025-06-26','2025-06-24','2025-06-23','2025-06-22','2025-06-21','2025-06-20','2025-06-19','2025-06-17','2025-06-16','2025-06-15','2025-06-14','2025-06-13','2025-06-12','2025-06-10','2025-06-09','2025-06-08','2025-06-07','2025-06-06','2025-06-06','2025-06-03','2025-06-02','2025-06-01',]

      const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // function to go to the previous month
  const prevMonth=()=>{
    if (currentMonth===0) {
        setCurrentMonth(11)//set month to december 11
        setCurrentYear(currentYear-1) // set year to 2024
    }else{
        setCurrentMonth(currentMonth-1)
    }
    setSelectedDate(null)//set selected date to null when month changes
  }

  //function to go to the next month
  const nextMonth = ()=>{
    if (currentMonth===11) {
        setCurrentMonth(0)//set month to january
        setCurrentYear(currentYear+1) //  set year to 2026
    }else{
        setCurrentMonth(currentMonth+1) 
    }
    setSelectedDate(null)
  }
  //this functionality will or will not be given to the users not required i think
  const handleDayPress=(day)=>{
    const dateString = `${currentYear}-${ String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    setSelectedDate(dateString)
    // ('selected date is  ',dateString);
    
  }
  //function to get the attendance status of the day
  const getAttendanceStatus = (day)=>{
    
    
    const dateString = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const match = presentDates.find(date=>date===dateString)

    if (match) {
     
      
      return 'present'
    }
      
    return null
    
    
  }

  //function to render the days of the month
  const renderCalendarDays = ()=>{
    const days = []
    // get the number of days in the current month
    //new Date(year,monthIndex + 1,0)gives the last day of the monthIndex
    const daysInMonth = new Date(currentYear,currentMonth+1,0).getDate()
    //get the first day of the month (0 for sunday , 1 for monday)
    const firstDayOfMonth = new Date(currentYear,currentMonth,1).getDay()

    //render empty cells because some months start from tuesday or maybe sunday
    for(let i = 0 ; i<firstDayOfMonth;i++){
      days.push(<View key={`empty-start-${i}` } style={styles.dayCell}/>)
    }

    //add cells for each day of the month
    
    for (let day = 1; day <= daysInMonth; day++) {
        
        const status = getAttendanceStatus(day)
        const dateStrForSelection = `${currentYear}-${String(currentMonth+1).padStart(2,0)}-${String(day).padStart(2,0)}`


        let dayCellStyle = [styles.dayCell]
        let dayTextStyle = [styles.dayText]

        if (status==="present") {
            dayCellStyle.push(styles.bothPresentCell);
            dayTextStyle.push(styles.presentText);
        }else{
            dayCellStyle.push(styles.normalCell)
        }

        //highlight selected date

        if(selectedDate===dateStrForSelection){
            dayCellStyle.push(styles.selectedDayCell)
            dayTextStyle.push(styles.selectedDayText)
        }

        days.push(<TouchableOpacity
        
            key={day}
            style={dayCellStyle}
            onPress={()=>handleDayPress(day)}

        >
            
            <Text style={dayTextStyle}>{day}</Text>
        </TouchableOpacity>)
        
    }

    // Add empty cells to fill the last row if needed (optional, for consistent grid look)
    const totalSlots = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;
    const remainingSlots = totalSlots - (daysInMonth + firstDayOfMonth);
    for (let i = 0; i < remainingSlots; i++) {
        days.push(<View key={`empty-end-${i}`} style={styles.dayCell} />);
    }


    return days

  }


  //Add empty cells for days before the 1st of the month
  useEffect(()=>{
    const todayDate = new Date().toISOString().split('T')[0]
    setSelectedDate(todayDate)
  },[])
  return (
    <View style={styles.container}>
        
    {/* Header month year and navigation buttons */}
    <View style={styles.header}>

        <TouchableOpacity
        onPress={prevMonth}
        style={styles.navButton}

        >   
            {/* learned something new */}
            <Text style={styles.navButtonText}>{"<"}</Text>

        </TouchableOpacity>

        <Text
         style={styles.monthYearText}
        >{monthNames[currentMonth]} {currentYear}</Text>

        <TouchableOpacity
        onPress={nextMonth}
        style={styles.navButton}

        >
            <Text style={styles.navButtonText}>{">"}</Text>
        </TouchableOpacity>
    </View>

    {/* Day names monday tuesday wednesday etc */}
    <View style={styles.dayNamesRow}>

        {['S','M','T','W','T','F','S'].map((dayName,index)=>
        (
            <Text key={`${dayName}-${index}`} style={styles.dayNameText} >
                {dayName}
            </Text>
        )
        )}

    </View>

    {/* Calendar Grid */}
    <View style={styles.calendarGrid}>
        {renderCalendarDays()}
    </View>


          {/* Selected Date Display */}
      {selectedDate && (
        <Text style={styles.selectedDateText}>
          {selectedDate}
        </Text>
      )}




    </View>
  )
}

export default Calendar

// StyleSheet: This is how you define styles in React Native
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    // borderRadius: 12,
    margin: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 10, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 7,
    borderColor:'#000',
    borderWidth:0.2,
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '300',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: 0.5,
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  dayNameText: {
    width: dayCellWidth,
    textAlign: 'center',
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    
  },
  dayCell: {
    width: dayCellWidth,
    height: dayCellWidth,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 100, // Make cells circular
    
  },
  dayText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '400',
  },
  selectedDayCell: {
    backgroundColor: '#000000',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  normalCell: {
    backgroundColor: '#F9F9F9',
  },
  bothPresentCell: {
    backgroundColor: '#E1FA57',
    // borderWidth: 0.2,
    // borderColor: '#000',
  },
  presentText: {
    color: '#000000',
  },
  selectedDateText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
});