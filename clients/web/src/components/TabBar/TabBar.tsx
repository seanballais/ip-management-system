import * as React from 'react';
import TabBarState from "./TabBarState.ts";
import './TabBar.css';

interface TabBarProps {
    tabBarState: TabBarState;
    setTabBarState: React.Dispatch<React.SetStateAction<TabBarState>>;
}

function TabBar({tabBarState, setTabBarState}: TabBarProps): React.ReactNode {
    function changeTab(index: number) {
        if (tabBarState.activeTabIndex != index) {
            setTabBarState((state: TabBarState): TabBarState => ({
                ...state,
                activeTabIndex: index
            }));
        }
    }

    return (
        <div className='tab-bar margin-center'>
            {
                tabBarState.tabNames.map((name: string, index: number) => {
                    const isActiveTab: boolean = tabBarState.activeTabIndex == index;

                    return (
                        <button
                            key={`tab-bar-${index}`}
                            className={isActiveTab ? 'tab-bar-button active' : 'tab-bar-button'}
                            onClick={(): void => {
                                changeTab(index);
                            }}>{name}</button>
                    );
                })
            }
        </div>
    );
}

export default TabBar;
