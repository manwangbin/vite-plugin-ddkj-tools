import type { Auth } from './auth';

/** The storage namespace */
declare namespace Storage {
  interface Session {
    ddkjDesignToken: string;
    /**token type*/
    ddkjDesignTokenType: string;
    /** The user info */
    userInfo: Auth.AccountInfo;

    /** The theme color */
    themeColor: string;
    // /**
    //  * the theme settings
    //  */
    // themeSettings: App.Theme.ThemeSetting;
  }

  interface Local {
    themeColor: string;
  }
}
