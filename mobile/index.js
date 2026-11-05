import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register both names so native app loading succeeds regardless of component key requested
AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent('SmartMechanicFinder', () => App);
AppRegistry.registerComponent('GetFix', () => App);

