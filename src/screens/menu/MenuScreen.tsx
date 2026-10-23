import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';

import TreeItem from '../../components/forms/MenuTreeComponent';
import {getMenuData} from '../../services/api/menuApi';
import {useGrid} from '../../context/GridProvider';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import { useAppTheme } from '../../theme/ThemeContext';


interface MenuItem {
  menuNumber: string;
  menuCaption?: string;
  menuName?: string;
  parent?: boolean;
  expanded?: boolean;
  loading?: boolean;
  children?: MenuItem[];
}


const MenuScreen = ({navigation}: any) => {

  const {currentUser} = useGrid();
   const {colors} = useAppTheme();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = currentUser?.userId ?? '';

  useEffect(() => {
    console.log(
      'MenuScreen currentUser:',
      currentUser
    );
     if (!currentUser?.userId) {
        console.log(
        'User not logged in - menu API will not be called'
      );
        return;
    }
    loadRootMenus();
  }, [currentUser?.userId]);

  /**
   * Load root menus
   */
  const loadRootMenus = async () => {
    try {
         const userId = currentUser?.userId;

    if (!userId) {
      return;
    }
      setLoading(true);
console.log(
        'Loading root menus for:',
        userId
      );
      const data = await getMenuData(
        '0',
        userId,
      );

      setMenuItems(data);

    } catch (error) {

      console.error(
        'Error loading root menus:',
        error,
      );

    } finally {
      setLoading(false);
    }
  };

  /**
   * Menu click
   */
  const handleMenuClick = async (item: MenuItem) => {

    console.log(
      'Menu clicked:',
      item.menuNumber,
      item.menuCaption,
    );

    /**
     * Leaf menu
     */
    if (!item.parent) {
      handleNavigation(item);
      return;
    }

    /**
     * Children already loaded
     */
    if (item.children !== undefined) {

      setMenuItems(prev =>
        updateMenuItem(
          prev,
          item.menuNumber,
          {
            expanded: !item.expanded,
          },
        ),
      );

      return;
    }

    /**
     * First click on parent
     * Load children from API
     */
    try {

      setMenuItems(prev =>
        updateMenuItem(
          prev,
          item.menuNumber,
          {
            loading: true,
          },
        ),
      );

      const children = await getMenuData(
        item.menuNumber,
        userId,
      );

      setMenuItems(prev =>
        updateMenuItem(
          prev,
          item.menuNumber,
          {
            children: children || [],
            expanded: true,
            loading: false,
          },
        ),
      );

    } catch (error) {

      console.error(
        'Error loading children for:',
        item.menuNumber,
        error,
      );

      setMenuItems(prev =>
        updateMenuItem(
          prev,
          item.menuNumber,
          {
            loading: false,
          },
        ),
      );
    }
  };

  /**
   * Update menu item recursively
   */
  const updateMenuItem = (
    items: MenuItem[],
    menuNumber: string,
    changes: Partial<MenuItem>,
  ): MenuItem[] => {

    return items.map(item => {

      if (item.menuNumber === menuNumber) {

        return {
          ...item,
          ...changes,
        };
      }

      if (item.children) {

        return {
          ...item,

          children: updateMenuItem(
            item.children,
            menuNumber,
            changes,
          ),
        };
      }

      return item;
    });
  };

  /**
   * Navigate when leaf menu is clicked
   */
  const handleNavigation = (item: MenuItem) => {

    console.log(
      'Navigate:',
      item.menuNumber,
     // item.angularPath,
    );

    navigation.closeDrawer();

    /**
     * Your existing RN screen navigation
     */
    // if (item.screen) {

    //   navigation.navigate('Main', {
    //     screen: item.screen,
    //   });

    //   return;
    // }

    /**
     * Angular navigation
     */
    // if (item.angularPath) {

    //   navigation.navigate('AngularScreen', {
    //     path: item.angularPath,
    //     menuNumber: item.menuNumber,
    //     menuName: item.menuName,
    //     menuCaption: item.menuCaption,
    //     relatedFilter: item.relatedFilter,
    //     filterNeed: item.filterNeed,
    //   });

    //   return;
    // }

    console.warn(
      'No navigation configured for menu:',
      item.menuNumber,
    );
  };

  // if (loading) {

  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //       }}
  //     >
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }


if (loading) {
  return (
    <View style={[
        styles.loadingContainer,
        {backgroundColor: colors.background},
      ]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
  return (
    // <ScrollView>
    //   {menuItems.map(item => (
    //     <TreeItem
    //       key={item.menuNumber}
    //       item={item}
    //       //navigation={navigation}
    //       onPress={handleMenuClick}
    //     />
    //   ))}
    // </ScrollView>

     <View style={[styles.drawer, {backgroundColor: colors.background}]}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.menuContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Fixed Home menu */}
      <TouchableOpacity
        style={[
          styles.fixedMenuRow,
          {
            backgroundColor: colors.surfaceSecondary,
            borderBottomColor: colors.border,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => {
          navigation.closeDrawer();
          navigation.navigate('Main',{
            screen:'Home'
          });
        }}
      >
        <MaterialIcons
          name="home"
          size={21}
          color={colors.primary}
        />
        <Text style={[styles.fixedMenuText, {color: colors.text}]}>Home</Text>
      </TouchableOpacity>

      {/* Fixed Dashboard menu */}
      <TouchableOpacity
        style={[
          styles.fixedMenuRow,
          {
            backgroundColor: colors.surfaceSecondary,
            borderBottomColor: colors.border,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => {
          navigation.closeDrawer();
          navigation.navigate('Main' ,{
            screen:'dashboard'
          });
        }}
      >
        <MaterialIcons
          name="dashboard"
          size={21}
          color={colors.primary}
        />
        <Text style={[styles.fixedMenuText, {color: colors.text}]}>Dashboard</Text>
      </TouchableOpacity>

      {/* Separator */}
      <View style={[
          styles.menuSeparator,
          {backgroundColor: colors.border},
        ]} />
      {menuItems.map(item => (
        <TreeItem
          key={item.menuNumber}
          item={item}
          onPress={handleMenuClick}
        />
      ))}
    </ScrollView>
  </View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    // backgroundColor: '#354858',
  },
  scrollView: {
    flex: 1,
  },
  menuContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    // backgroundColor: '#354858',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedMenuRow: {
  minHeight: 48,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  gap: 12,
  // backgroundColor: '#405466',
  borderBottomWidth: StyleSheet.hairlineWidth,
  // borderBottomColor: '#4B5E6D',
},

fixedMenuText: {
  // color: '#F4F7F9',
  fontSize: 14,
  fontWeight: '500',
},

menuSeparator: {
  height: 2,
  // backgroundColor: '#718392',
  marginVertical: 8,
  marginHorizontal: 12,
},
});

export default MenuScreen;