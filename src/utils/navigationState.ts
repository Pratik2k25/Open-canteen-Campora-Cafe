export type NavTab = 'home' | 'order' | 'profile' | 'other';

export interface NavState {
  currentTab: NavTab;
  isHomeActive: boolean;
  isOrderActive: boolean;
  isProfileActive: boolean;
  isCartActive: boolean;
  showBottomNav: boolean;
  sliderPosition: 0 | 1; // 0 for Home, 1 for Order
}

export function computeNavState(pathname: string): NavState {
  const isProfileActive = pathname === '/profile' || pathname.startsWith('/profile/');
  const isOrderActive = pathname === '/orders' || pathname.startsWith('/orders/');
  const isCartActive = pathname === '/cart' || pathname.startsWith('/cart/');
  const isHomeActive = pathname === '/';

  let currentTab: NavTab = 'other';
  if (isHomeActive) currentTab = 'home';
  else if (isOrderActive) currentTab = 'order';
  else if (isProfileActive) currentTab = 'profile';

  return {
    currentTab,
    isHomeActive,
    isOrderActive,
    isProfileActive,
    isCartActive,
    // BottomNav is strictly hidden on /profile and /cart (Cart has its own sticky checkout action bar)
    showBottomNav: !isProfileActive && !isCartActive,
    sliderPosition: isOrderActive ? 1 : 0,
  };
}

export type TransitionStage = 'idle' | 'to-profile' | 'from-profile';

export interface SpatialTransitionState {
  stage: TransitionStage;
  fromPath: string;
  toPath: string;
  mainTransform: string;
  profileTransform: string;
  transitionDurationMs: number;
}

export function computeSpatialTransition(
  prevPath: string,
  currPath: string,
  isSliding: boolean,
  prefersReducedMotion = false
): SpatialTransitionState {
  const isGoingToProfile = prevPath !== '/profile' && currPath === '/profile';
  const isReturningFromProfile = prevPath === '/profile' && currPath !== '/profile';

  if (prefersReducedMotion) {
    return {
      stage: 'idle',
      fromPath: prevPath,
      toPath: currPath,
      mainTransform: currPath === '/profile' ? 'translateX(-100%)' : 'translateX(0%)',
      profileTransform: currPath === '/profile' ? 'translateX(0%)' : 'translateX(100%)',
      transitionDurationMs: 0,
    };
  }

  if (isGoingToProfile) {
    return {
      stage: 'to-profile',
      fromPath: prevPath,
      toPath: currPath,
      mainTransform: isSliding ? 'translateX(-100%)' : 'translateX(0%)',
      profileTransform: isSliding ? 'translateX(0%)' : 'translateX(100%)',
      transitionDurationMs: 380,
    };
  }

  if (isReturningFromProfile) {
    return {
      stage: 'from-profile',
      fromPath: prevPath,
      toPath: currPath,
      mainTransform: isSliding ? 'translateX(0%)' : 'translateX(-100%)',
      profileTransform: isSliding ? 'translateX(100%)' : 'translateX(0%)',
      transitionDurationMs: 380,
    };
  }

  // Idle state
  const onProfile = currPath === '/profile';
  return {
    stage: 'idle',
    fromPath: prevPath,
    toPath: currPath,
    mainTransform: onProfile ? 'translateX(-100%)' : 'translateX(0%)',
    profileTransform: onProfile ? 'translateX(0%)' : 'translateX(100%)',
    transitionDurationMs: 0,
  };
}

export function resolveProfileBackTarget(lastNonProfilePath: string | null): string {
  if (lastNonProfilePath && lastNonProfilePath.startsWith('/orders')) {
    return '/orders';
  }
  return '/';
}

export const NAVIGATION_ASSETS = {
  homeActive3dWebp: '/assets/navigation/home-active-3d.webp',
  homeActive3dPng: '/assets/navigation/home-active-3d.png',
  orderActive3dWebp: '/assets/navigation/order-active-3d.webp',
  orderActive3dPng: '/assets/navigation/order-active-3d.png',
  profile3dWebp: '/assets/navigation/profile-3d.webp',
  profile3dPng: '/assets/navigation/profile-3d.png',
} as const;
