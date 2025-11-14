import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';

const Menu = ({ prop }) => {
  // start with the active item from props
  const [selectedItem, setSelectedItem] = useState(prop || 'Map');

  const menuData = [
    { id: 'Map', label: 'Map', iconLib: Ionicons, iconName: 'map-outline', activeColor: '#1E90FF' },
    { id: 'Reports', label: 'Reports', iconLib: Feather, iconName: 'alert-triangle', activeColor: '#FF4500' },
    { id: 'Settings', label: 'Settings', iconLib: Ionicons, iconName: 'settings-outline', activeColor: '#895129' },
  ];

  const handleSelected = (itemId) => {
    setSelectedItem(itemId);
  };

  return (
    <View style={styles.menuContainer}>
      {menuData.map((item) => {
        const IconComponent = item.iconLib;
        const isActive = selectedItem === item.id;

        return (
          <Link
            key={item.id}
            href={item.id === 'Map' ? '/' : `/Pages/${item.id}`}
            asChild
          >
            <Pressable
              onPress={() => handleSelected(item.id)}
              style={styles.menuItem}
            >
              <View
                style={[
                  styles.iconContainer,
                  isActive && { backgroundColor: item.activeColor + '20' }, // light highlight
                ]}
              >
                <IconComponent
                  name={item.iconName}
                  size={24}
                  color={isActive ? item.activeColor : '#555'}
                />
              </View>
              <Text
                style={[
                  styles.menuText,
                  isActive && { color: item.activeColor },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    bottom: 24,
    left: 16,
    right: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 6,
    borderRadius: 999,
  },
  menuText: {
    marginTop: 4,
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
});
