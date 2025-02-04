import type { Auth } from './auth';

/** The storage namespace */
declare namespace Storage {
  interface Session {
    /** The theme color */
    themeColor: string;
    // /**
    //  * the theme settings
    //  */
    // themeSettings: App.Theme.ThemeSetting;
  }

  interface Local {
    /** The token */
    ddkjtoolsToken: string;
    /**token type*/
    ddkjtoolsTokenType: string;
    /** The user info */
    userInfo: Auth.AccountInfo;
    /** The theme color */
    themeColor: string;
  }
}
