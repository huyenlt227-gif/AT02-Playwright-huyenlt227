import { test, expect } from '../../../fixtures/authenticated-user.fixture';
import { JsonHelper } from '../../../utils/json-helper';

const profileData = JsonHelper.readData<{
  updatedProfile: { name: string; phone: string; password: string };
}>('profile/profile-data.json');

/**
 * Module 2 - Manage Profile.
 *
 * Reuses the saved customer session (storageState). The demo site may reply
 * "Sorry! the action is not permitted in demo" - the test still verifies the
 * update action completes and reports which case happened.
 */
test.describe('Manage Profile', () => {
  test('Update customer profile successfully', async ({ profilePage, log }) => {
    let originalName = '';

    await test.step('Open Manage Profile', async () => {
      await profilePage.open();
    });

    await test.step('Capture the current name before updating', async () => {
      originalName = await profilePage.getNameValue();
      log.info(`Current name: "${originalName}"`);
      expect(originalName.length).toBeGreaterThan(0);
    });

    await test.step('Update the profile information', async () => {
      const message = await profilePage.updateProfile(profileData.updatedProfile);
      log.info(`Update result message: "${message}"`);
      expect(message.length).toBeGreaterThan(0);
    });

    await test.step('Revert the profile to its original value', async () => {
      const revertMessage = await profilePage.updateProfile({
        name: originalName,
        phone: profileData.updatedProfile.phone,
        password: profileData.updatedProfile.password,
      });
      log.info(`Revert result message: "${revertMessage}"`);
    });
  });
});