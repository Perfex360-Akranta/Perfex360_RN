import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import MaterialIcons from '@react-native-vector-icons/material-icons';

const TreeItem = ({item, navigation, level = 0}: any) => {
  const [expanded, setExpanded] = useState(false);

  const hasChildren =
    item.children && item.children.length > 0;

  return (
    <View>
      <TouchableOpacity
        style={[styles.row, {paddingLeft: level * 20 + 10}]}
        onPress={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          } else {
            //navigation.navigate(item.screen);
            //navigation.getParent()?.navigate(item.screen);
            navigation.closeDrawer();
            navigation.navigate('Main', {
      screen: item.screen,
    });

            
            
          }
        }}>
        {hasChildren ? (
          <MaterialIcons
            name={expanded ? 'expand-more' : 'chevron-right'}
            size={22}
          />
        ) : (
          <View style={{width: 22}} />
        )}

        <Text style={styles.title}>{item.title}</Text>
      </TouchableOpacity>

      {expanded &&
        hasChildren &&
        item.children.map((child: any) => (
          <TreeItem
            key={child.id}
            item={child}
            navigation={navigation}
            level={level + 1}
          />
        ))}
    </View>
  );
};

export default TreeItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  title: {
    marginLeft: 5,
    fontSize: 16,
  },
});