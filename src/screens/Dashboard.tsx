import React, { useState } from 'react';
import { useTheme } from '../theme';
import BrutalistCard from '../ui/BrutalistCard';
import BrutalistButton from '../ui/BrutalistButton';
import StatTile from '../ui/StatTile';
import NavBar from '../ui/NavBar';
import NoticeBar from '../ui/NoticeBar';
import ProgressBar from '../charts/ProgressBar';
import Sparkline from '../charts/Sparkline';
import { MView, MPressable, animations } from '../motion/M';

export function Dashboard() {
  const { colors, spacing, fonts } = useTheme();
  const [activeNavItem, setActiveNavItem] = useState('home');

  // Sample data
  const campaignProgress = 68;
  const meetingTimes = [
    { time: '10:00', label: 'Team standup' },
    { time: '12:30', label: 'Client review' },
    { time: '18:00', label: 'Project sync' },
  ];

  const leadsData = [12, 18, 15, 25, 22, 30, 28, 35, 32, 28, 24, 20];
  const avatarCount = 3;

  // Starburst icon component
  const StarburstIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 2L17.5 6.5L22 8L17.5 9.5L16 14L14.5 9.5L10 8L14.5 6.5L16 2Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M24 10L25 12.5L27.5 13.5L25 14.5L24 17L23 14.5L20.5 13.5L23 12.5L24 10Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M8 18L8.5 20L10.5 20.5L8.5 21L8 23L7.5 21L5.5 20.5L7.5 20L8 18Z"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );

  // Navigation items
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      value: 'home',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      value: 'calendar',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      value: 'tasks',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3 8-8" />
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.67 0 3.22.46 4.56 1.26" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      value: 'profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const containerStyles: React.CSSProperties = {
    backgroundColor: colors.black,
    minHeight: '100vh',
    padding: spacing['2xl'],
    paddingBottom: 120, // Space for nav bar
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gap: spacing['2xl'],
    maxWidth: 1200,
    margin: '0 auto',
  };

  const rowTwoStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing['2xl'],
  };

  const rightColumnStyles: React.CSSProperties = {
    display: 'grid',
    gap: spacing['2xl'],
  };

  const meetingItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  };

  const timeStyles: React.CSSProperties = {
    ...fonts.title,
    color: colors.black,
    fontWeight: 700,
    minWidth: 60,
  };

  const meetingLabelStyles: React.CSSProperties = {
    ...fonts.body,
    color: colors.black,
    margin: 0,
  };

  const viewAllStyles: React.CSSProperties = {
    ...fonts.body,
    color: colors.black,
    textDecoration: 'underline',
    fontWeight: 600,
    cursor: 'pointer',
    margin: 0,
    marginTop: spacing.md,
  };

  const plannedCallContentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  };

  const callTimeStyles: React.CSSProperties = {
    ...fonts.display,
    color: colors.black,
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
  };

  const avatarsContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: -spacing.md,
  };

  const avatarStyles: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: colors.black,
    marginLeft: -spacing.md,
    border: `2px solid ${colors.cobalt}`,
  };

  const leadsContentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  };

  const leadsTextStyles: React.CSSProperties = {
    ...fonts.body,
    color: colors.black,
    margin: 0,
    fontWeight: 500,
  };

  return (
    <div style={containerStyles}>
      <div style={gridStyles}>
        {/* Row 1: Campaign Card */}
        <MView {...animations.slideUp} transition={{ delay: 0 }}>
          <BrutalistCard
            color="neonYellow"
            header="Campaign"
            meta="College team meeting"
            rightIcon={<StarburstIcon />}
          >
            <div style={{ marginTop: spacing.lg }}>
              <ProgressBar
                value={campaignProgress}
                color="neonYellow"
                size="lg"
                animated
                showValue
                style={{
                  filter: 'brightness(0.8)', // Darken for better contrast on yellow
                }}
              />
            </div>
          </BrutalistCard>
        </MView>

        {/* Row 2: Two Column Layout */}
        <div style={rowTwoStyles}>
          {/* Left: Today Meets */}
          <MView {...animations.slideUp} transition={{ delay: 0.1 }}>
            <BrutalistCard
              color="neonPink"
              header="Today"
              meta="Meets"
            >
              <div>
                {meetingTimes.map((meeting, index) => (
                  <div key={index} style={meetingItemStyles}>
                    <span style={timeStyles}>{meeting.time}</span>
                    <p style={meetingLabelStyles}>{meeting.label}</p>
                  </div>
                ))}
                <p style={viewAllStyles}>View all meeting →</p>
              </div>
            </BrutalistCard>
          </MView>

          {/* Right: Two stacked cards */}
          <div style={rightColumnStyles}>
            {/* Planned Call */}
            <MView {...animations.slideUp} transition={{ delay: 0.2 }}>
              <BrutalistCard
                color="cobalt"
                header="Planned call"
                meta="Support team"
              >
                <div style={plannedCallContentStyles}>
                  <p style={callTimeStyles}>09:15 AM</p>
                  <div style={avatarsContainerStyles}>
                    {Array.from({ length: avatarCount }, (_, index) => (
                      <div
                        key={index}
                        style={{
                          ...avatarStyles,
                          zIndex: avatarCount - index,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </BrutalistCard>
            </MView>

            {/* Leads Activity */}
            <MView {...animations.slideUp} transition={{ delay: 0.3 }}>
              <BrutalistCard
                color="neonGreen"
                header="Leads activity"
                meta="Assign 4 new job descriptions"
              >
                <div style={leadsContentStyles}>
                  <p style={leadsTextStyles}>
                    Activity trending upward with strong conversion rates
                  </p>
                  <Sparkline
                    data={leadsData}
                    color="neonGreen"
                    width={120}
                    height={32}
                    strokeWidth={2}
                    style={{ filter: 'brightness(0.8)' }}
                  />
                </div>
              </BrutalistCard>
            </MView>
          </div>
        </div>

        {/* Notice Bar */}
        <MView {...animations.slideUp} transition={{ delay: 0.4 }}>
          <NoticeBar
            notificationCount={5}
            message="Notifications"
            onPress={() => console.log('Navigate to notifications')}
            aria-label="5 new notifications"
          />
        </MView>
      </div>

      {/* Bottom Navigation */}
      <NavBar
        items={navItems}
        activeValue={activeNavItem}
        onChange={setActiveNavItem}
      />
    </div>
  );
}

export default Dashboard;
