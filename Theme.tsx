import { useState, createContext, ReactNode } from "react";

type ThemeContextType = {
    theme: "light" | "dark";
    changeTheme: () => void;
    position: "left" | "right";
    openAnalytics: () => void;
    analyticsState: "openA" | "closeA";
    openPlanning: () => void;
    planningState: "openP" | "closeP";
    openHome: () => void;
    categoryState:"openCategory" | "closeCategory";
    showCategory: () => void ;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProps = {
    children: ReactNode;
};

export default function Theme({ children }: ThemeProps) {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [position, setPosition] = useState<"left" | "right">("left");
    const [analyticsState, setAnalyticsState] = useState<"openA" | "closeA">("closeA");
    const [planningState, setPlanningState] = useState<"openP" | "closeP">("closeP");
    const [categoryState,setCategoryState] = useState<"openCategory" | "closeCategory">("closeCategory");

    const changeTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
        setPosition((prevPosition) => (prevPosition === "left" ? "right" : "left"));
    };

    const openAnalytics = () => {
        if (analyticsState === "closeA") {
            setAnalyticsState("openA");
            setPlanningState("closeP"); // Close planning when analytics is opened
        } else {
            setAnalyticsState("closeA");
        }
    };

    const openPlanning = () => {
        if (planningState === "closeP") {
            setPlanningState("openP");
            setAnalyticsState("closeA"); // Close analytics when planning is opened
        } else {
            setPlanningState("closeP");
        }
    };

    const openHome = () => {
        setPlanningState("closeP");
        setAnalyticsState("closeA");
    }

    const showCategory = () => {
        setCategoryState((prevCategory)=> (prevCategory === "closeCategory" ? "openCategory" : "closeCategory"));
    }

    return (
        <ThemeContext.Provider value={{ 
            theme, 
            changeTheme, 
            position, 
            analyticsState, 
            openAnalytics, 
            planningState, 
            openPlanning,
            openHome,
            categoryState,
            showCategory 
        }}>
            {children}
        </ThemeContext.Provider>
    );
}
