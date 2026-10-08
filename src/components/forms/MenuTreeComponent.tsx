import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import MaterialIcons from '@react-native-vector-icons/material-icons';

interface TreeItemProps {
  item: any;
  level?: number;
  onPress: (item: any) => void;
}

const TreeItem = ({
  item,
  level = 0,
  onPress,
}: TreeItemProps) => {

  // API gives parent: true for menus which can have children
  const hasChildren = item.parent === true;

  return (
    <View>

      <TouchableOpacity
        style={[
          styles.row,
          {
            paddingLeft: level * 20 + 10,
          },
        ]}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >

        {hasChildren ? (
          <MaterialIcons
            name={
              item.expanded
                ? 'expand-more'
                : 'chevron-right'
            }
            size={22}
          />
        ) : (
          <View style={{width: 22}} />
        )}

        <Text style={styles.title}>
          {item.menuCaption || item.menuName || ''}
        </Text>

        {item.loading && (
          <ActivityIndicator
            size="small"
            style={styles.loader}
          />
        )}

      </TouchableOpacity>

      {item.expanded &&
        item.children &&
        item.children.length > 0 && (

          <View>
            {item.children.map((child: any) => (

              <TreeItem
                key={child.menuNumber}
                item={child}
                level={level + 1}
                onPress={onPress}
              />

            ))}
          </View>
        )}

    </View>
  );
};

export default TreeItem;

const styles = StyleSheet.create({

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 10,
  },

  title: {
    marginLeft: 5,
    fontSize: 16,
    flex: 1,
  },

  loader: {
    marginLeft: 10,
  },

});