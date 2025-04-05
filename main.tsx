import { useContext, useEffect, useRef, useState } from "react";
import { useWindowDimensions, View, StyleSheet, Animated, TouchableOpacity, Text, TextInput, ScrollView, Image } from "react-native";
import { ThemeContext } from "./Theme";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCcMastercard, faCcVisa, faPaypal } from "@fortawesome/free-brands-svg-icons";
import { faArrowDown, faArrowRotateLeft, faArrowsSpin, faBasketShopping, faBed, faBolt, faBuildingColumns, faBus,  faCarOn, faCarSide, faCartArrowDown, faCartShopping, faCheck, faChurch, faFaceSmile, faFaucetDrip, faFileInvoiceDollar, faFireFlameSimple, faGasPump, faGear, faGears, faHandHoldingDollar, faHandHoldingHeart, faHotel, faHouseUser, faMicrochip, faMosque, faParking, faPenNib, faPiggyBank, faPlane, faPrescriptionBottleMedical, faPumpMedical, faRecycle, faScrewdriverWrench, faShoppingCart, faSquareParking, faStethoscope, faTelevision, faTrainTram, faTrashCan, faTShirt, faTv, faUtensils, faWifi } from "@fortawesome/free-solid-svg-icons";
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import PieChart from 'react-native-pie-chart';





export default function Main() {

    const window = useWindowDimensions();
    const context = useContext(ThemeContext);
   
    if (!context) {
        throw new Error("ThemeContext must be used within a ThemeProvider");
    }

    const {   theme, 
        changeTheme, 
        position, 
        analyticsState, 
        openAnalytics, 
        planningState, 
        openPlanning,
        openHome,
        categoryState,
        showCategory,
        settings,
        toggleSettings, } = context;

    // Set initial positions based on state

    const rotateRefresh = useRef(new Animated.Value(0)).current;
    const [loading, setLoading] = useState(false);
    const loopAnimation = useRef<any>(null);
    const on_off_settings = useRef(new Animated.Value(window.width)).current;
    const left_right = useRef(new Animated.Value(position === "left" ? window.width * -0.037 : window.width * 0.114)).current;
    const open_close_analytics = useRef(new Animated.Value(analyticsState === "openA" ? 0 : window.width)).current;
    const open_close_planning = useRef(new Animated.Value(planningState === "openP" ? 0 : window.width)).current;
    const [selectionColorHome,setSelectionColorHome] = useState<any>("orange");
    const [selectionColorAnalytics,setSelectionColorAnalytics] = useState<any>("transparent");
    const [selectionColorPlanning,setSelectionColorPlanning] = useState<any>("transparent");
    const categoryTranslateX = useRef(new Animated.Value(categoryState === "openCategory" ? window.width*-0.102 : window.width)).current;
    const [date, setDate] = useState<Date | null>(null);
    const [monthlyIncome, setMonthlyIncome] = useState<string>(""); // should be a number
    const [moneySpent, setMoneySpent] = useState<any>(0); // should be a number
    const [activityName, setActivityName] = useState<any>("");  // should be a string
    const [categoryName, setCategoryName] = useState<string>("Select Category");
    const [showData,setShowData] = useState<any[]>([]);
    const [iconMap, setIconMap] = useState<{ [key: string]: any }>({}); 
    const [iconBgColor,setIconBgColor] = useState<{ [key: string]: any }>({}); 
    const [checkmarkColor,setCheckmarkColor] = useState<any>("rgb(255, 255, 255)");
    const [latestMonthlyIncome, setLatestMonthlyIncome] = useState<number>(0);
    const [monthlySum,setMonthlySum] = useState<number>(0);
    const [savings,setSavings] = useState<number>(0);
    const [loadSeries,setLoadSeries] = useState<any[]>([]);
    const [seriesSum,setSeriesSum] = useState<number>(0);
    const [savingsPercent,setSavingsPercent] = useState<number>(0);
    const [monthlyPercent,setMonthlyPercent] = useState<number>(0);
    const [moveDeleteBtn,setMoveDeleteBtn] = useState<number>(0.5);
    const [updateSettings, setUpdateSettings] = useState<"openSettings" | "closeSettings">("closeSettings");
    const [intro,setIntro] = useState<number>(0);
    
    const showIntro = () => {
        setTimeout(()=>{
            setIntro(-1);
        },6000);
    }


    const widthAndHeight = 200;

    const series = [
        { value: Number(monthlySum), color: "rgb(245,103,1)", label: { text: 'Spending', fontWeight: 'bold', fill:"white", offsetY: 5, offsetX: 0 } },
        { value: Number(latestMonthlyIncome) || 0, color: "rgb(118,99,213)", label: { text: 'Monthly Income', fontWeight: 'bold', fill:"white", offsetY: 5, offsetX: -35 } },
        { value: Number(savings), color: "rgb(68, 208, 94)", label: { text: 'Savings', fontWeight: 'bold', offsetY: 5, offsetX: 2 , fill:"white"} },
      ];
      
    const clearTextFields = () => {
        setMoneySpent("");
        setMonthlyIncome("");
        setActivityName("");
        setCategoryName("Select Category");
        setCheckmarkColor("rgb(255, 255, 255)");
    }

    const enableDeleteBtn = () => {
        setMoveDeleteBtn(0.01);
    }

    const disableDeleteBtn = () => {
        setMoveDeleteBtn(0.5);
    }

    const sendFinanceData = async () => {
        const parsedData = {
            date: new Date().toLocaleString('en-US', { 
                timeZone: 'Africa/Nairobi', 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit'
              }), // Store as ISO format for consistency
              monthlyIncome: isNaN(parseFloat(monthlyIncome.toString())) ? 0 : parseFloat(monthlyIncome.toString()),
              moneySpent:parseFloat(moneySpent.toString()),
              activityName,
              categoryName  
        };
            console.log(parsedData);
           
        try {
            await axios.post("https://financeapi-1.onrender.com/send", parsedData);
            console.log("Successfully sent Finance Data");
            setCheckmarkColor("rgb(68, 208, 94)");
        } catch (error) {
            console.error("Unable to send Finance Data", error);
        }
    };

    const displayFinanceData = async () => {
        setLoading(true);
      
        // Start rotation
        loopAnimation.current = Animated.loop(
          Animated.timing(rotateRefresh, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          })
        );
        rotateRefresh.setValue(0); // reset before loop
        loopAnimation.current.start();
      
        try {
          const response = await axios.get("https://financeapi-1.onrender.com/getData");
          setShowData(response.data); // Store the full data array
      
          const categoryIcons: { [key: string]: any } = {
            "House Rent": faHouseUser,
            "Shopping": faShoppingCart,
            "Food": faUtensils,
            "Public Transport": faBus,
            "Private Car": faCarSide,
            "Hotel": faHotel,
            "Wifi": faWifi,
            "TV Subscription": faTv,
            "Groceries": faBasketShopping,
            "Water Bill": faFaucetDrip,
            "Electricity Bill": faBolt,
            "Hospital": faStethoscope,
            "Pharmacy": faPrescriptionBottleMedical,
            "Electronic Device": faMicrochip,
            "Clothes": faTShirt,
            "Maintainance": faScrewdriverWrench,
            "Salary": faFileInvoiceDollar,
            "Hired Vehicle": faCarOn,
            "Fun Activity": faFaceSmile,
            "Air Travel": faPlane,
            "Online Shopping": faCartArrowDown,
            "Waste Collection": faRecycle,
            "Parking Bill": faParking,
            "Room Rent": faBed,
            "Church Collection": faChurch,
            "Mosque Donations": faMosque,
            "Charity": faHandHoldingHeart,
            "Hygiene Product": faPumpMedical,
            "Tax Bill": faBuildingColumns,
            "Fuel": faGasPump,
            "Gas": faFireFlameSimple,
          };
      
          const categoryColors: { [key: string]: any } = {
            "House Rent": "rgb(153,0,101)",
            "Wifi": "rgb(153,0,101)",
            "TV Subscription": "rgb(153,0,101)",
            "Groceries": "rgb(153,0,101)",
            "Water Bill": "rgb(153,0,101)",
            "Electricity Bill": "rgb(153,0,101)",
            "Hospital": "rgb(153,0,101)",
            "Pharmacy": "rgb(153,0,101)",
            "Public Transport": "rgb(245,103,1)",
            "Private Car": "rgb(245,103,1)",
            "Fuel": "rgb(245,103,1)",
            "Gas": "rgb(245,103,1)",
            "Hotel": "rgb(245,103,1)",
            "Electronic Device": "rgb(245,103,1)",
            "Food": "rgb(68, 208, 94)",
            "Clothes": "rgb(68, 208, 94)",
            "Maintainance": "rgb(68, 208, 94)",
            "Salary": "rgb(68, 208, 94)",
            "Hired Vehicle": "rgb(68, 208, 94)",
            "Fun Activity": "rgb(68, 208, 94)",
            "Air Travel": "rgb(68, 208, 94)",
            "Online Shopping": "rgb(68, 208, 94)",
            "Waste Collection": "rgb(68, 208, 94)",
            "Parking Bill": "rgb(118,99,213)",
            "Room Rent": "rgb(118,99,213)",
            "Church Collection": "rgb(118,99,213)",
            "Mosque Donations": "rgb(118,99,213)",
            "Charity": "rgb(118,99,213)",
            "Hygiene Product": "rgb(118,99,213)",
            "Tax Bill": "rgb(118,99,213)",
            "Shopping": "rgb(118,99,213)",
          };
      
          const colorMapping = response.data.reduce((acc: { [x: string]: any }, item: { _id: string | number; categoryName: string | number; }) => {
            acc[item._id] = categoryColors[item.categoryName] || "rgb(153,0,101)";
            return acc;
          }, {});
      
          setIconBgColor(colorMapping);
      
          const iconMapping = response.data.reduce((acc: { [x: string]: any }, item: { _id: string | number; categoryName: string | number; }) => {
            acc[item._id] = categoryIcons[item.categoryName] || faHouseUser;
            return acc;
          }, {});
      
          setIconMap(iconMapping);
        } catch (error) {
          console.log("Unable to fetch data", error);
        } finally {
          setLoading(false);
          if (loopAnimation.current) {
            loopAnimation.current.stop(); // Stop rotating even on error
          }
        }
      };
      
    const fetchMonthlyIncome = async () => {
        try {
          const response = await axios.get("https://financeapi-1.onrender.com/latestMonthlyIncome");
          setLatestMonthlyIncome(response.data.monthlyIncome);
        } catch (error) {
          console.log("Error fetching income:", error);
        }
      };

    const fetchMonthlySum = async () => {
        try {
            const response = await axios.get("https://financeapi-1.onrender.com/data/sum");
            setMonthlySum(response.data.totalMoneySpent);
        } catch (error) {
            console.log("Error fetching sum of monthly expenses:", error); 
        }
    }  

    const calculateMonthlySavings = () => {
        const monthlySavings = (latestMonthlyIncome) - monthlySum;
        setSavings(parseFloat(monthlySavings.toFixed(1)));

        const newSavingsPercent = monthlySavings / latestMonthlyIncome;
        setSavingsPercent(parseFloat(newSavingsPercent.toFixed(2)));

        const newMonthlyPercent = monthlySum / latestMonthlyIncome;
        setMonthlyPercent(parseFloat(newMonthlyPercent.toFixed(2)));

        setLoadSeries(series);

         // Use 0 if undefined
        const totalSum = Number(monthlySum) + Number(latestMonthlyIncome) + Number(savings);
        setSeriesSum(totalSum) ;
        
    }

    // Function to delete item
    const deleteData = async (id: string) => {
        try {
          await axios.delete(`https://financeapi-1.onrender.com/deleteData/${id}`);
          console.log("Deleted successfully");
        } catch (error) {
          console.error("Error deleting data:", error);
        }
      };
      
      const refreshData = () => {
        fetchMonthlyIncome();
        displayFinanceData();
        fetchMonthlySum();
        calculateMonthlySavings();
      }

    useEffect(() => {
       refreshData();
       setMoneySpent("");
       showIntro();
    }, []);

    // Run `calculateMonthlySavings` only when `latestMonthlyIncome` or `monthlySum` updates  
useEffect(() => {
    if (latestMonthlyIncome !== null && monthlySum !== null && seriesSum  === null ) {
      calculateMonthlySavings();
    }
    setTimeout(() => {
      calculateMonthlySavings();
    }, 5000);
  }, [latestMonthlyIncome, monthlySum,seriesSum]);

  

  const rotateInterpolate = rotateRefresh.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedRotation = {
    transform: [{ rotate: rotateInterpolate }],
  }

   const settingsAnimation = (toValue: number) => {
    Animated.timing(on_off_settings, {
        toValue,
        duration: 400,
        useNativeDriver: true, // Ensure false for translateX
    }).start();
   };

    const moveAnimation = (toValue: number) => {
        Animated.timing(left_right, {
            toValue,
            duration: 400,
            useNativeDriver: true, // ⚠️ Use false for translateX
        }).start();
    };

    const analyticsAnimation = (toValue: number) => {
        Animated.timing(open_close_analytics, {
            toValue,
            duration: 400,
            useNativeDriver: false, 
        }).start();
    };

    const planningAnimation = (toValue: number) => {
        Animated.timing(open_close_planning, {
            toValue,
            duration: 400,
            useNativeDriver: false, 
        }).start();
    };

    const categoryAnimation = (toValue: number) => {
        Animated.timing(categoryTranslateX, {
            toValue,
            duration: 400,
            useNativeDriver: true, 
        }).start();
    };

    const handleSettings = () => {
        setUpdateSettings((prevSettings) => {
            const newSettings = prevSettings === "closeSettings" ? "openSettings" : "closeSettings";
            
            // Trigger animation based on new state
            const toValue = newSettings === "openSettings" ? window.width * -0.004 : window.width;
            settingsAnimation(toValue);
            
            return newSettings; // Ensure we return the correct string state
        });
    };

    const handleCategory = () => {
        const nextCategoryPosition = categoryState === "closeCategory" ? "openCategory" : "closeCategory";
        showCategory();
        categoryAnimation(nextCategoryPosition === "openCategory" ? window.width*-0.102 : window.width)
    }

    const handlePress = () => {
        const nextPosition = position === "left" ? "right" : "left";
        changeTheme();
        moveAnimation(nextPosition === "left" ? window.width * -0.037 : window.width * 0.116);
    };

    const changeAnalyticsPosition = () => {
        const newAnalyticsState = analyticsState === "closeA" ? "openA" : "closeA";
        openAnalytics();
        analyticsAnimation(newAnalyticsState === "openA" ? 0 : window.width);
        setSelectionColorAnalytics("orange");
        setSelectionColorHome("transparent");
        setSelectionColorPlanning("transparent");
    };
    
    const changePlanningPosition = () => {
        const newPlanningState = planningState === "closeP" ? "openP" : "closeP";
        openPlanning();
        planningAnimation(newPlanningState === "openP" ? 0 : window.width);
        setSelectionColorAnalytics("transparent");
        setSelectionColorHome("transparent");
        setSelectionColorPlanning("orange");
    };

    const closeAnalyticsPlanning = () => {
        openHome();
        setSelectionColorAnalytics("transparent");
        setSelectionColorHome("orange");
        setSelectionColorPlanning("transparent");
    }

    useEffect(() => {
        analyticsAnimation(analyticsState === "openA" ? 0 : window.width);
    }, [analyticsState, window.width]);
    
    useEffect(() => {
        planningAnimation(planningState === "openP" ? 0 : window.width);
    }, [planningState, window.width]);
    
  
    return (

        <Animated.View style={[styles.container, { height: window.height,
         width: window.width, backgroundColor: theme === "light" ? "#fff" : "#000" }]}>
      
            {/* Analytics View */}
            <Animated.View style={[styles.AnalyticsContainer, { height: window.height,
                 width: window.width, backgroundColor: theme === "light" ? "#fff" : "#000",
                  transform: [{ translateX: open_close_analytics }],zIndex:3,
                  justifyContent:"center",alignItems:"center",paddingTop:15 }]} >

              <View style={{height:window.height*0.055,width:window.width,
                justifyContent:"center",alignItems:"center"}} >
                <Text style={{ display: "flex", position: "relative",
                     color: theme === "light" ? "#000" : "#fff",
                      fontSize: RFValue(20),fontWeight:"700"}}>
                   Analytics
                </Text>
              </View>  

               <View style={{height:window.height*0.045,width:window.width,
                justifyContent:"center",paddingLeft:20}} >
                <Text style={{ display: "flex", position: "relative",
                     color: theme === "light" ? "#000" : "#fff",
                      fontSize: RFValue(16),fontWeight:"700"}}>
                   This Month 
                </Text>
              </View> 

              // Percentage progress bars for savings & Spending
              <View style={{height:window.height*0.05,width:window.width,
                backgroundColor:"transparent",paddingLeft:40,
                alignItems:"center",flexDirection:"column",gap:0}} >
                 
                 // Savings Progress bar chart 
              <View style={{height:window.height*0.03,width:window.width,
                backgroundColor:"transparent",padding:0,
                alignItems:"center",flexDirection:"row",gap:10}} >
                 <Text style={{ display: "flex", position: "relative",
                     color: theme === "light" ? "#000" : "#fff",
                      fontSize: RFValue(14),fontWeight:"700"}}>
                  Savings
                </Text> 

                 <View style={{height:window.height*0.01,width:window.width*0.8*savingsPercent,
                backgroundColor:"rgb(68, 208, 94)",borderRadius:30,}} >

                </View> 
                <Text style={{ display: "flex", position: "relative",
                     color: theme === "light" ? "#000" : "#fff",
                      fontSize: RFValue(14),fontWeight:"700"}}>
                 {savingsPercent*100}%
                </Text> 
              </View> 

                  // Spending Progress bar chart 
              <View style={{height:window.height*0.03,width:window.width,
                backgroundColor:"transparent",padding:0,
                alignItems:"center",flexDirection:"row",gap:10}} >
                 <Text style={{ display: "flex", position: "relative",
                     color: theme === "light" ? "#000" : "#fff",
                      fontSize: RFValue(14),fontWeight:"700"}}>
                  Spending
                </Text> 

                 <View style={{height:window.height*0.01,width:window.width*0.8*monthlyPercent,
                backgroundColor:"rgb(245,103,1)",borderRadius:30,}} >
                </View> 
                <Text style={{ display: "flex", position: "relative",
                     color: theme === "light" ? "#000" : "#fff",
                      fontSize: RFValue(14),fontWeight:"700"}}>
                 {monthlyPercent*100}%
                </Text> 
              </View>              

              </View>  
                 
              // PIE CHART    
            <View style={{height:window.height*0.28,width:window.width,
             justifyContent:"center",alignItems:"center",overflow:"hidden",}}>
        
             {seriesSum > 0 ? (
            <PieChart widthAndHeight={widthAndHeight} series={loadSeries} cover={0.6} />
            ) : (
             <View><Text>No data to display</Text></View>
             )}
            </View>

            <View style={{height:window.height*0.1,width:window.width*0.5,
            top:window.height*0.26,position:"absolute",
            justifyContent:"center",alignItems:"center",flexDirection:"column",}}>
                <Text style={{ display: "flex", position: "relative",
                     color: theme === "light" ? "#000" : "#fff",
                      fontSize: RFValue(12),fontWeight:"700"}}>
                 Tsh{latestMonthlyIncome}
                </Text> 
                <Text style={{ display: "flex", position: "relative",
                     color: theme === "light" ? "#000" : "#fff",
                      fontSize: RFValue(10),fontWeight:"700"}}>
                  in 3 categories
                </Text> 
            </View>
           
            // Statistics display of spending 
             <View style={{height:window.height*0.55,width:window.width,
                backgroundColor:theme ==="light" ? "#fff" : "#fff",padding:0,
                alignItems:"center",flexDirection:"column",overflow:"hidden",
                borderTopLeftRadius:60,borderTopRightRadius:60}} >
                   <View style={{height:window.height*0.03,width:window.width,
                     backgroundColor:"transparent",padding:0,justifyContent:"center",
                     alignItems:"center",flexDirection:"row",gap:10}} >
                         <Text style={{ display: "flex", position: "relative",
                             color: theme === "light" ? "#000" : "#000",
                             fontSize: RFValue(18),fontWeight:"700"}}>
                               Statistics
                        </Text> 
                   </View>
                   <View style={{height:window.height*0.4,width:window.width,
                     backgroundColor:theme ==="light" ? "#fff" : "#fff",padding:0,justifyContent:"center",
                     alignItems:"center",flexDirection:"row",gap:0}} >
                 <ScrollView>
                     {showData.map((item: any, index: number) => {
                     return (
                     <View key={item.id ?? index} style={[
                    styles.financePanel, 
                       { 
                height: window.height * 0.05,
                width: window.width ,
                 backgroundColor: theme ==="light" ? "#fff" : "#fff",
                 borderBottomColor:"white"
                   }
              ]}>
             <View style={{height:window.height*0.08,width:window.width*0.12,alignItems:"center",flexDirection:"row",}} >
              <View style={{height:window.height*0.05,width:window.width*0.115,borderRadius:10,overflow:"hidden",
               alignItems:"center",justifyContent:"center", backgroundColor: "transparent"}} >
                <Text style={{ display: "flex", position: "relative",
                     color: iconBgColor[item._id] || "rgb(153,0,101)",
                      fontSize: RFValue(12),fontWeight:"700"}}>
                 {parseFloat(((item.moneySpent / monthlySum) * 100).toFixed(1))}%
                </Text> 
              </View>
            </View> 
            <View style={{height:window.height*0.022,width:window.width*0.6,flexDirection:"row",gap:5,}} >
            <View style={{height:window.height*0.022,width:window.width*0.17,}} >
            <Text style={{color:theme === "light" ? "#000" : "#000",fontSize:RFValue(11),fontWeight:"700"}} >{item.activityName}</Text>
            </View>
            <View style={{height:window.height*0.01,width:window.width*0.4,
                backgroundColor:"rgb(218, 218, 218)",borderRadius:30,
                overflow:"hidden",top:window.height*0.005}}>
            <View style={{height:window.height*0.01,width:window.width*0.4*item.moneySpent / monthlySum,justifyContent:"center",backgroundColor:iconBgColor[item._id] || "rgb(153,0,101)",borderRadius:30}}></View>
            </View>
            </View>
            <View style={{height:window.height*0.022,width:window.width*0.2,alignItems:"flex-end"}} >
            <Text style={{color:theme === "light" ? "#000" : "#000",fontSize:RFValue(11),fontWeight:"700"}} >Tsh {item.moneySpent}</Text>
            </View> 
          
        </View>
            );
        })}
       </ScrollView>
            </View>
        </View>

     
            </Animated.View>

            {/* Planning View */}
            <Animated.View style={[styles.PlanningContainer, {
                 height: window.height, width: window.width,
                  backgroundColor:  theme === "light" ? "#fff" : "#000",
                   transform: [{ translateX: open_close_planning }] ,zIndex:4 }]}> 
                       <Text style={{position:"absolute",top:window.height*0.03,
                        fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >
                         Plan your Finance 
                      </Text> 
              
              // Check Mark confirming sent data.
            <View style={{height: window.height*0.05, width: window.width*0.1,
                  backgroundColor:  theme === "light" ? "#000" : "rgb(245,103,1)",borderRadius:100,
                  position:"absolute",top:window.height*0.035,left:window.width*0.85,
                  justifyContent:"center",alignItems:"center"}} >
                <FontAwesomeIcon icon={faCheck} color={checkmarkColor} size={RFValue(20)} />
            </View>

            <View style={[styles.nameTagPanel,{
                height:window.height*0.09,width:window.width*0.95,
                backgroundColor:theme === "light" ? "#000" : "#fff",
                borderRadius:20,top:window.height*0.09,
                }]} >
                <TouchableOpacity onPress={()=>setMonthlyIncome("")} >
                    <View style={{display:"flex",position:"relative",justifyContent:"center",
                        alignItems:"center", height:window.height*0.08,width:window.width*0.18,
                        borderRadius:20,backgroundColor:"rgb(118,99,213)",
                    }} >
                     <FontAwesomeIcon icon={faPiggyBank} color="white" size={RFValue(40)} />
                    </View>
                </TouchableOpacity>    
                <TextInput placeholder="Monthly Income" placeholderTextColor={theme === "light" ? "#000" : "#fff"}
                 keyboardType="numeric"   disableFullscreenUI={true} 
                 editable={false}  selectTextOnFocus={false} value={monthlyIncome.toString()}
                 style={[styles.input,{height:window.height*0.08,width:window.width*0.7,
                 backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                 color:theme === "light" ? "#000" : "#fff",
                 borderRadius:20,}]} /> 
            </View> 
             <View style={[styles.nameTagPanel,{
                height:window.height*0.09,width:window.width*0.95,
                backgroundColor:theme === "light" ? "#000" : "#fff",
                borderRadius:20,top:window.height*0.19,
                }]} >
                <TouchableOpacity onPress={()=>setMoneySpent("")} >
                    <View style={{display:"flex",position:"relative",justifyContent:"center",
                        alignItems:"center", height:window.height*0.08,width:window.width*0.18,
                        borderRadius:20,backgroundColor:"rgb(68, 208, 94)",
                    }} >
                     <FontAwesomeIcon icon={faHandHoldingDollar} color="white" size={RFValue(40)} />
                    </View>
                </TouchableOpacity>    
                <TextInput placeholder="Money Spent" placeholderTextColor={theme === "light" ? "#000" : "#fff"}
                   value={moneySpent.toString()} onChangeText={(text)=> setMoneySpent(text)}
                   inputMode="numeric"
                 style={[styles.input,{height:window.height*0.08,width:window.width*0.7,
                 backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                 color:theme === "light" ? "#000" : "#fff",
                 borderRadius:20,}]} />   
            </View> 
            <View style={[styles.nameTagPanel,{
                height:window.height*0.09,width:window.width*0.95,
                backgroundColor:theme === "light" ? "#000" : "#fff",
                borderRadius:20,top:window.height*0.29,
                }]} >
                <TouchableOpacity onPress={()=>setActivityName("")} >
                    <View style={{display:"flex",position:"relative",justifyContent:"center",
                        alignItems:"center", height:window.height*0.08,width:window.width*0.18,
                        borderRadius:20,backgroundColor:"rgb(245,103,1)",
                    }} >
                     <FontAwesomeIcon icon={faPenNib} color="white" size={RFValue(40)} />
                    </View>
                </TouchableOpacity>    
                <TextInput placeholder="Tag Name"   placeholderTextColor={theme === "light" ? "#000" : "#fff"}
                   value={activityName} onChangeText={(text)=> setActivityName(text)}
                 style={[styles.input,{height:window.height*0.08,width:window.width*0.7,
                 backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                 color:theme === "light" ? "#000" : "#fff",
                 borderRadius:20,}]} /> 
            </View> 
            <View style={[styles.nameTagPanel,{
                height:window.height*0.09,width:window.width*0.95,
                backgroundColor:theme === "light" ? "#000" : "#fff",
                borderRadius:20,top:window.height*0.39,
                }]} >
                <TouchableOpacity onPress={sendFinanceData} >
                    <View style={{display:"flex",position:"relative",justifyContent:"center",
                        alignItems:"center", height:window.height*0.08,width:window.width*0.18,
                        borderRadius:20,backgroundColor:"rgb(153,0,101)",
                    }} >
                     <FontAwesomeIcon icon={faFloppyDisk} color="white" size={RFValue(40)} />
                    </View>
                </TouchableOpacity>   

                {/* Drop Down Menu With Icons */} 
               <View style={[styles.selectorPanel,{height:window.height*0.08,width:window.width*0.7,
                 backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                 borderRadius:20,}]} >
                    <View  style={{display:"flex",position:"relative",justifyContent:"center",
                        alignItems:"center", height:window.height*0.07,width:window.width*0.5}} >
                        <Text style={{position:"relative",fontSize:RFValue(20),
                        color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >{categoryName}</Text>
                        </View>
                   <TouchableOpacity  onPress={handleCategory}  style={{height:window.height*0.07,
                    width:window.width*0.15,justifyContent:"center",alignItems:"center"}} >
                   <View style={{display:"flex",position:"relative",justifyContent:"center",
                        alignItems:"center", height:window.height*0.07,width:window.width*0.15,
                        borderRadius:100,backgroundColor:"rgb(118,99,213)",
                    }} >
                     <FontAwesomeIcon icon={faArrowDown} color="white" size={RFValue(25)} />
                    </View>
                   </TouchableOpacity>

                    <Animated.View style={[styles.dropDownPanel,{
                     height:window.height*0.4,width:window.width*0.97,
                      backgroundColor:theme === "light" ? "#fff" : "#000",top:window.height*0.1,
                      transform: [{ translateX: categoryTranslateX }]}]} >

                       <ScrollView>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                            <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Public Transport</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Public Transport")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(118,99,213)", }} >
                              <FontAwesomeIcon icon={faBus} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Private Car</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Private Car")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor: "rgb(68, 208, 94)", }} >
                              <FontAwesomeIcon icon={faCarSide} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Hotel</Text>
                            </View>
                             <TouchableOpacity  onPress={()=> setCategoryName("Hotel")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor: "rgb(245,103,1)", }} >
                              <FontAwesomeIcon icon={faHotel} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Wifi</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Wifi")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(153,0,101)", }} >
                              <FontAwesomeIcon icon={faWifi} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >TV Subscription</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("TV Subscription")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(118,99,213)", }} >
                              <FontAwesomeIcon icon={faTelevision} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Food</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Food")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(68, 208, 94)", }} >
                              <FontAwesomeIcon icon={faUtensils} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Groceries</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Groceries")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(68, 208, 94)", }} >
                              <FontAwesomeIcon icon={faBasketShopping} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Water Bill</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Water Bill")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(153,0,101)", }} >
                              <FontAwesomeIcon icon={faFaucetDrip} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Electricity Bill</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Electricity")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(153,0,101)", }} >
                              <FontAwesomeIcon icon={faBolt} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Hospital</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Hospital")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(118,99,213)", }} >
                              <FontAwesomeIcon icon={faStethoscope} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Pharmacy</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Pharmacy")} >
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(118,99,213)", }} >
                              <FontAwesomeIcon icon={faPrescriptionBottleMedical} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Electronic Device</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Electronic Device")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(245,103,1)", }} >
                              <FontAwesomeIcon icon={faMicrochip} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Clothes</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Clothes")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(245,103,1)", }} >
                              <FontAwesomeIcon icon={faTShirt} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >House Rent</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("House Rent")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(153,0,101)", }} >
                              <FontAwesomeIcon icon={faHouseUser} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Maintainance</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Maintainance")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(245,103,1)", }} >
                              <FontAwesomeIcon icon={faScrewdriverWrench} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Salary</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Salary")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(153,0,101)", }} >
                              <FontAwesomeIcon icon={faFileInvoiceDollar} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Hired Vehicle</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Hired Vehicle")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(153,0,101)", }} >
                              <FontAwesomeIcon icon={faCarOn} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Shopping</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Shopping")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(118,99,213)", }} >
                              <FontAwesomeIcon icon={faCartShopping} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Fun Activity</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Fun Activity")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(118,99,213)", }} >
                              <FontAwesomeIcon icon={faFaceSmile} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Air Travel</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Air Travel")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(68, 208, 94)", }} >
                              <FontAwesomeIcon icon={faPlane} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Online Shopping</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Online Shopping")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(68, 208, 94)", }} >
                              <FontAwesomeIcon icon={faCartArrowDown} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Waste Collection Bill</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Waste Collection")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(68, 208, 94)", }} >
                              <FontAwesomeIcon icon={faRecycle} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Parking Bill</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Parking Bill")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(245,103,1)", }} >
                              <FontAwesomeIcon icon={faSquareParking} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Room Rent</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Room Rent")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(245,103,1)", }} >
                              <FontAwesomeIcon icon={faBed} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Church Collections</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Church Collection")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(118,99,213)", }} >
                              <FontAwesomeIcon icon={faChurch} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Mosque Donations</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Mosque Donations")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(118,99,213)", }} >
                              <FontAwesomeIcon icon={faMosque} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Charity</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Charity")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(68, 208, 94)", }} >
                              <FontAwesomeIcon icon={faHandHoldingHeart} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} > Hygiene Product</Text>
                            </View>
                             <TouchableOpacity  onPress={()=> setCategoryName("Hygiene Product")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(153,0,101)", }} >
                              <FontAwesomeIcon icon={faPumpMedical} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Tax bill</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Tax Bill")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(153,0,101)", }} >
                              <FontAwesomeIcon icon={faBuildingColumns} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Fuel</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Fuel")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(245,103,1)", }} >
                              <FontAwesomeIcon icon={faGasPump} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Train </Text>
                            </View>
                             <TouchableOpacity  onPress={()=> setCategoryName("Train")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(68, 208, 94)", }} >
                              <FontAwesomeIcon icon={faTrainTram} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                          <View style={[styles.selectorPanelIn,{height:window.height*0.08,width:window.width*0.9,
                          backgroundColor:theme === "light" ? "#fff" : "#000",position:"relative",
                          borderRadius:20,}]} >
                             <View style={{height:window.height*0.08,width:window.width*0.7,justifyContent:"center"}} >
                            <Text style={{position:"relative",fontSize:RFValue(20),color:theme === "light" ? "#000" : "#fff", fontWeight:"500"}} >Gas</Text>
                            </View>
                             <TouchableOpacity onPress={()=> setCategoryName("Gas")}>
                             <View style={{display:"flex",position:"relative",justifyContent:"center", alignItems:"center", height:window.height*0.07,width:window.width*0.15,borderRadius:100,backgroundColor:"rgb(153,0,101)", }} >
                              <FontAwesomeIcon icon={faFireFlameSimple} color="white" size={RFValue(25)} />
                             </View> 
                             </TouchableOpacity>
                          </View>

                       </ScrollView>

                    </Animated.View>

                 </View>                
            </View> 

                 {/* Calculator Panel with Buttons*/}
                <View style={[styles.calculatorPanel,{
                    height:window.height*0.4,width:window.width*0.95,
                      backgroundColor:theme === "light" ? "black" : "white",top:window.height*0.495
                      }]} >
                        <View style={[styles.buttonPanel,{
                            height:window.height*0.10,width:window.width*0.93,
                            backgroundColor:"transparent"
                            }]} >
                         <TouchableOpacity onPress={()=> setMonthlyIncome(monthlyIncome + "7")} 
                          style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" :"rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}} >7</Text>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={()=> setMonthlyIncome(monthlyIncome + "8")}
                         style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" : "rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}} >8</Text>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={()=> setMonthlyIncome(monthlyIncome + "9")}
                          style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" : "rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}} >9</Text>
                            </View>
                        </TouchableOpacity> 
                        </View>

                        <View style={[styles.buttonPanel,{
                            height:window.height*0.10,
                            width:window.width*0.93,
                            backgroundColor:"transparent"}]} >

                         <TouchableOpacity onPress={()=>  setMonthlyIncome(monthlyIncome + "4")}
                             style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" :"rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}}  >4</Text>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={()=>  setMonthlyIncome(monthlyIncome + "5")}
                          style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" :"rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}} >5</Text>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={()=> setMonthlyIncome(monthlyIncome + "6")}
                          style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" : "rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}} >6</Text>
                            </View>
                        </TouchableOpacity> 
                        </View>

                        <View style={[styles.buttonPanel,{
                            height:window.height*0.10,
                            width:window.width*0.93,
                            backgroundColor:"transparent"}]} >

                         <TouchableOpacity  onPress={()=>  setMonthlyIncome(monthlyIncome + "1")}
                           style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" : "rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}}  >1</Text>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={()=> setMonthlyIncome(monthlyIncome + "2")}
                          style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" : "rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}} >2</Text>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity  onPress={()=>  setMonthlyIncome(monthlyIncome + "3")}
                          style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" :"rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}} >3</Text>
                            </View>
                        </TouchableOpacity> 
                        </View>

                        <View style={[styles.buttonPanel,{
                            height:window.height*0.10,
                            width:window.width*0.93,
                            backgroundColor:"transparent"}]} >

                         <TouchableOpacity onPress={()=>  setMonthlyIncome(monthlyIncome + "0")}
                           style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" :"rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}} >0</Text>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={()=>  setMonthlyIncome(monthlyIncome + ".")}
                          style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                                width:window.width*0.29,borderRadius: 10,
                                backgroundColor:theme === "light" ? "white" : "rgb(220, 220, 220)",}]} >
                                <Text style={{fontSize:RFValue(26), color:theme === "light" ? "black" : "black"}} >.</Text>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={clearTextFields}
                         style={{borderRadius: 10, overflow: "hidden"}} >
                            <View style={[styles.button,{ height:window.height*0.08,
                               width:window.width*0.29,borderRadius: 10,
                               backgroundColor:theme === "light" ? "white" :"rgb(220, 220, 220)"}]} >
                            <FontAwesomeIcon icon={faArrowRotateLeft} size={RFValue(26)}
                             color={theme === "light" ? "black" : "black"}/>
                            </View>
                        </TouchableOpacity> 
                       
                        </View>
                </View>    
            </Animated.View> 

          

            {/* Toggle Theme Switch */}
            <View style={[styles.toggle, { height: window.height * 0.04, width: window.width * 0.25, borderRadius: 30, backgroundColor: theme === "light" ? "#000" : "#fff", top: window.height * 0.04, left: window.width * 0.74 }]}>
                <TouchableOpacity onPress={handlePress}>
                    <Animated.View style={[styles.switch, { height: window.height * 0.035, width: window.width * 0.07, borderRadius: 100, backgroundColor: theme === "light" ? "#fff" : "#000", transform: [{ translateX: left_right }], left: window.width * -0.037 }]}>
                        <Ionicons name={theme === "light" ? "sunny" : "moon"} size={RFValue(18)} color={theme === "light" ? "orange" : "#fff"} />
                    </Animated.View>
                </TouchableOpacity>
                <Text style={{ display: "flex", position: "absolute", color: theme === "light" ? "#fff" : "#000", fontSize: RFValue(8), left: theme === "light" ? window.width * 0.12 : window.width * 0.03 }}>{theme.toUpperCase()}</Text>
            </View>


            {/* Menu Bar */}
            <View style={[styles.MenuContainer, { height: window.height * 0.086, width: window.width * 0.96,
                 backgroundColor: theme === "light" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)", borderRadius: 100,
                top: window.height * 0.9, left: window.width * 0.02,zIndex:5,
                borderWidth:4,borderColor: theme === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)" }]}>
                <TouchableOpacity onPress={closeAnalyticsPlanning}  style={{ borderRadius: 10, overflow: "hidden" }} >
                    <View style={[styles.iconContainer, { height: window.height * 0.065,
                         width: window.width * 0.2,backgroundColor:selectionColorHome,
                        }]}>
                        <Ionicons name="home" size={RFValue(25)} color={theme === "light" ? "#fff" : "#000"} />
                        <Text style={{ color: theme === "light" ? "#fff" : "#000", fontWeight: "700", fontSize: RFValue(10) }}>Home</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={changeAnalyticsPosition}  style={{ borderRadius: 10, overflow: "hidden" }}>
                    <View style={[styles.iconContainer, { height: window.height * 0.065,
                         width: window.width * 0.2,backgroundColor:selectionColorAnalytics,
                        }]}>
                        <Ionicons name="stats-chart" size={RFValue(25)} color={theme === "light" ? "#fff" : "#000"} />
                        <Text style={{ color: theme === "light" ? "#fff" : "#000", fontWeight: "700", fontSize: RFValue(10) }}>Analytics</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={changePlanningPosition}  style={{ borderRadius: 10, overflow: "hidden" }}>
                    <View style={[styles.iconContainer, { height: window.height * 0.065,
                         width: window.width * 0.2,backgroundColor:selectionColorPlanning,
                       }]}>
                        <Ionicons name="calculator" size={RFValue(25)} color={theme === "light" ? "#fff" : "#000"} />
                        <Text style={{ color: theme === "light" ? "#fff" : "#000", fontWeight: "700", fontSize: RFValue(10) }}>Planning</Text>
                    </View>
                </TouchableOpacity>
            </View>

           // Quick Settings Button
          <TouchableOpacity  onPress={handleSettings} style={{height:window.height*0.05,width:window.width*0.12,
           left:window.width * 0.45,top:window.height*0.035,borderRadius:200,
           position:"absolute",justifyContent:"center",alignItems:"center",
           backgroundColor:theme === "light" ? "#000" : "#fff" }} >
           <View style={{height:window.height*0.05,width:window.width*0.12,
            borderRadius:200,
           position:"absolute",justifyContent:"center",alignItems:"center",
           backgroundColor:theme === "light" ? "#000" : "#fff" }} >
             <FontAwesomeIcon icon={faGear} size={RFValue(20)} color={theme === "light" ? "#fff" : "#000"} />
           </View>
          </TouchableOpacity>

                {/* Linear Gradient Display */}
        <LinearGradient 
         colors={['rgb(72, 105, 252)', 'rgb(14, 107, 165)', 'rgb(31, 42, 102)']} start={ {x: 0.1, y: 0.2} } 
          style={[styles.card,{ height: window.height * 0.25, width: window.width * 0.9, borderRadius: 30,top:window.height*0.1,left:window.width*0.045}]} >
           <FontAwesomeIcon icon={faCcVisa} size={RFValue(30)} color="rgb(187, 187, 188)" style={{left:window.width * 0.75,top:window.height*0.01,position:"absolute"}}/>
           <FontAwesomeIcon icon={faCcMastercard}size={RFValue(30)} color="rgb(187, 187, 188)" style={{left:window.width * 0.75,top:window.height*0.19,position:"absolute"}}/>
           <FontAwesomeIcon icon={faPaypal} size={RFValue(30)} color="rgb(187, 187, 188)" style={{left:window.width * 0.03,top:window.height*0.19,position:"absolute"}}/>
           <Text style={{fontSize:RFValue(16),fontWeight:"700",top:window.height*0.01,left:window.width*0.05,color:'rgb(255, 255, 255)',position:"absolute"}} >Wallet</Text>
           <Text style={{fontSize:RFValue(36),fontWeight:"700",color:'rgb(255, 255, 255)',position:"absolute"}} >Tsh {latestMonthlyIncome}</Text>
        </LinearGradient>
           
      
        // Settings Pannel
        <Animated.View
          style={{ height: window.height * 0.25, width: window.width * 0.9,position:"absolute",
           borderRadius: 30,top:window.height*0.1,left:window.width*0.045,backgroundColor:theme === "light" ? "#000" : "#fff",
           justifyContent:"center",alignItems:"center",flexDirection:"column",transform: [{ translateX: on_off_settings }] }} >
            <View style={{height: window.height * 0.1, width: window.width * 0.8,
                flexDirection:"row", justifyContent:"center",alignItems:"center",
                gap:20}} >
            <Text style={{fontSize:RFValue(16),fontWeight:"700",position:"relative",color:theme === "light" ? "#fff" : "#000"}} >Enable Delete Button</Text>
            <TouchableOpacity onPress={enableDeleteBtn} >
          <View style={{height:window.height*0.08,width:window.width*0.16,
              justifyContent:"center",alignItems:"center"
          }} >
          <FontAwesomeIcon icon={faTrashCan}size={RFValue(20)} color="rgb(68, 208, 94)" />
          </View>
            </TouchableOpacity>
            <Text style={{fontSize:RFValue(16),fontWeight:"700",color:"rgb(153,0,101)",position:"relative"}} >On</Text>
            </View>
            <View style={{height: window.height * 0.1, width: window.width * 0.8,
                flexDirection:"row", justifyContent:"center",alignItems:"center",
                gap:20}} >
            <Text style={{fontSize:RFValue(16),fontWeight:"700",color:theme === "light" ? "#fff" : "#000",position:"relative"}} >Disable Delete Button</Text>
            <TouchableOpacity onPress={disableDeleteBtn} >
            <View style={{height:window.height*0.08,width:window.width*0.16,
              justifyContent:"center",alignItems:"center"
          }} >
          <FontAwesomeIcon icon={faTrashCan}size={RFValue(20)} color="rgb(68, 208, 94)" />
          </View>
            </TouchableOpacity>
            <Text style={{fontSize:RFValue(16),fontWeight:"700",color:"rgb(153,0,101)",position:"relative"}} >Off</Text>
            </View>
        </Animated.View>


         // Money Spent Display
        <View style={[styles.miniDisplay,{ height: window.height * 0.1, width: window.width * 0.9,
             borderRadius: 30,top:window.height*0.385,left:window.width*0.045,
             backgroundColor:theme === "light" ? "#fff" : "#000",}]} >

            <View style={[styles.innerMiniDisplay,{ height: window.height * 0.08, width: window.width * 0.3,
             borderRadius:10,backgroundColor:"rgb(245,103,1)",}]}  >
                <Text style={{color:theme === "light" ? "#fff" : "#000",fontSize:RFValue(14),
                    fontWeight:"700"}} >
                        Money Spent
                        </Text>  
                <Text style={{color:theme === "light" ? "#000" : "#fff",fontSize:RFValue(12),
                    fontWeight:"700"}} >
                       Tsh {monthlySum}
                        </Text>            
            </View> 

           // Refresh Buttton
           <TouchableOpacity  onPress={refreshData}>
           <Animated.View style={[styles.refreshBtn,{ height: window.height * 0.08, width: window.width * 0.16,
             borderRadius:100,backgroundColor:theme === "light" ? "rgb(118,99,213)" : "#fff",},animatedRotation]} >
                <FontAwesomeIcon icon={faArrowsSpin} size={RFValue(35)} 
                color={theme === "light" ? "#fff" :  "rgb(118,99,213)"}/>
                </Animated.View>
           </TouchableOpacity>
 
            // Savings Display
            <View style={[styles.innerMiniDisplay,{ height: window.height * 0.08, width: window.width * 0.3,
             borderRadius:10,backgroundColor:"rgb(68, 208, 94)",}]}  >
                <Text style={{color:theme === "light" ? "#fff" : "#000",fontSize:RFValue(14),
                    fontWeight:"700"}} >Savings</Text>  
                <Text style={{color:theme === "light" ? "#000" : "#fff",fontSize:RFValue(12),
                    fontWeight:"700"}} >Tsh {savings}</Text>            
            </View> 

        </View>

        <Text style={{ display: "flex",
             position: "absolute",
              color: theme === "light" ? "#000" : "#fff",
               fontSize: RFValue(20), left: window.width * 0.06 ,
               top:window.height*0.04,fontWeight:"700"}}>
                Home
                </Text>

     // Display showing important data 
    <View style={[styles.dataViewPanel,{
        height: window.height * 0.6,width: window.width,
        top:window.height*0.5,
        backgroundColor:theme === "light" ? "#000" : "#fff",}]} >
        <View  style={{height:window.height*0.07,width:window.width,alignItems:"center",justifyContent:"center",
            backgroundColor:theme === "light" ? "#000" : "#fff"
        }}>
        <Text style={{color:theme === "light" ? "#fff" : "#000",fontSize:RFValue(20),fontWeight:"700"}} >
           Monthly Spending
        </Text>
        </View> 
        <View style={[styles.scrollPanel,{  height: window.height * 0.32,width: window.width,
        backgroundColor:theme === "light" ? "#000" : "#fff",}]} >
           <ScrollView>
       {showData.map((item: any, index: number) => {
    return (
        <View key={item.id ?? index} style={[
            styles.financePanel, 
            { 
                height: window.height * 0.08,
                width: window.width ,
                backgroundColor: theme ==="light" ? "rgb(0, 0, 0)" : "#fff",
                borderBottomColor:"white"
            }
        ]}>
             <View style={{height:window.height*0.08,width:window.width*0.15,alignItems:"center",flexDirection:"row"}} >
              <View style={{height:window.height*0.05,width:window.width*0.115,borderRadius:10,overflow:"hidden",
               alignItems:"center",justifyContent:"center", backgroundColor: iconBgColor[item._id] || "rgb(153,0,101)"}} >
              <FontAwesomeIcon icon={iconMap[item._id]} size={RFValue(20)} color="rgb(255, 255, 255)"/>
              </View>
            </View> 
            <View style={{height:window.height*0.055,width:window.width*0.32,justifyContent:"center",flexDirection:"column",overflow:"hidden"}} >
            <Text style={{color:theme === "light" ? "#fff" : "#000",fontSize:RFValue(12),fontWeight:"700",top:window.height*0.01}} >{item.activityName}</Text>
            <Text style={{color:theme === "light" ? "#fff" : "#000",fontSize:RFValue(12),fontWeight:"700",top:window.height*0.013}} >{item.date}</Text>
            </View>
            <View style={{height:window.height*0.08,width:window.width*0.45,alignItems:"center",flexDirection:"row",overflow:"hidden"}} >
            <TouchableOpacity onPress={()=>deleteData(item._id)}>
            <View style={{height:window.height*0.08,width:window.width*0.15,alignItems:"center",justifyContent:"center",left:window.width*moveDeleteBtn}} >
              <FontAwesomeIcon icon={faTrashCan} size={RFValue(16)} color="rgb(255, 0, 0)" style={{top:window.height*0.01}} />
            </View>
            </TouchableOpacity>
            <Text style={{color:theme === "light" ? "#fff" : "#000",fontSize:RFValue(12),fontWeight:"700",left:window.width*0.1,top:window.height*0.01}} >Tsh {item.moneySpent}</Text>
            </View> 
            
          
        </View>
    );
})}
       </ScrollView>
        </View>       
      
    </View>            
    // Intro Panel
          <View style={{height: window.height, width: window.width,position:"absolute",
           borderRadius: 30,top:window.height*intro,backgroundColor:theme === "light" ? "#fff" : "#fff",
           justifyContent:"center",alignItems:"center",flexDirection:"column",zIndex:7}} >  
          <Image source={require("./assets/logo.png")} 
          style={{height: window.height*0.2, width: window.width*0.8,objectFit:"cover"}}
          />
          </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
         position: "absolute" 
        },
    switch: {
         justifyContent: "center",
         alignItems: "center" 
        },
    toggle: {
         position: "absolute",
         justifyContent: "center",
         alignItems: "center" 
        },
    MenuContainer: { 
        position: "absolute",
        flexDirection: "row",
        gap: 20,
        justifyContent: "center",
        alignItems: "center" 
    },
    dataViewPanel:{
        display:"flex",
        alignItems: "center" ,
        borderRadius:50,
        overflow: "hidden", 
        flexDirection:"column",
    },
    scrollPanel:{
        display:"flex",
        alignItems: "center" ,
        overflow: "hidden", 
        flexDirection:"column",
        borderRadius:0,
    },
    financePanel:{
        display:"flex",
        justifyContent: "center",
        alignItems: "center" ,
        overflow: "hidden", 
        flexDirection:"row",
        gap:6,
    },
    iconContainer: { 
        display:"flex",
        justifyContent: "center",
        alignItems: "center" ,
        borderRadius:10,
        overflow: "hidden"
    },
    AnalyticsContainer: { 
        position: "absolute" 
    },
    PlanningContainer: { 
        position: "absolute",
        justifyContent: "center",
        alignItems: "center" ,
        overflow:"hidden",
     },
    card:{
        display:"flex",
        position:"absolute",
        justifyContent: "center",
        alignItems: "center" 
    }, 
    miniDisplay:{
        display:"flex",
        position:"absolute",
        justifyContent: "center",
        alignItems: "center" ,
        flexDirection:"row",
        gap:25
    }, 
    innerMiniDisplay:{
        display:"flex",
        position:"relative",
        justifyContent: "center",
        alignItems: "center" ,
        flexDirection:"column",
    }, 
    refreshBtn:{
        display:"flex",
        position:"relative",
        justifyContent: "center",
        alignItems: "center" ,
    }, 
    calculatorPanel:{
        display:"flex",
        position:"absolute",
        justifyContent: "center",
        alignItems: "center",
        flexDirection:"column",
       borderRadius:20,
    },
    buttonPanel:{
        display:"flex",
        position:"relative",
        justifyContent: "center",
        alignItems: "center",
        flexDirection:"row",
        gap:10,
    },
    button:{
        display:"flex",
        position:"relative",
        justifyContent: "center",
        alignItems: "center", 
        backgroundColor:"white",
    },
     nameTagPanel:{
        display:"flex",
        position:"absolute",
        justifyContent: "center",
        alignItems: "center",
        flexDirection:"row",
        gap:16,
    },
    input:{
        display:"flex",
        textAlign:"center",
        position:"relative",
    },
    selectorPanel:{
        display:"flex",
        position:"absolute",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"row",
        gap:10,
    },
    dropDownPanel:{
        display:"flex",
        position:"absolute",
        justifyContent: "center",
        alignItems: "center",
        flexDirection:"column",
        borderRadius:20,
        zIndex:5,
        gap:0
    },
    selectorPanelIn:{
        display:"flex",
        position:"absolute",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"row",
        gap:15,
    },
});
