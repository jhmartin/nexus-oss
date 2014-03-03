/**
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2007-2013 Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */

package org.sonatype.nexus.coreui

import com.softwarementors.extjs.djn.config.annotations.DirectAction
import com.softwarementors.extjs.djn.config.annotations.DirectMethod
import org.apache.shiro.authz.annotation.RequiresAuthentication
import org.apache.shiro.authz.annotation.RequiresPermissions
import org.sonatype.nexus.extdirect.DirectComponent
import org.sonatype.nexus.extdirect.DirectComponentSupport
import org.sonatype.nexus.jsecurity.realms.TargetPrivilegeDescriptor
import org.sonatype.nexus.jsecurity.realms.TargetPrivilegeGroupPropertyDescriptor
import org.sonatype.nexus.jsecurity.realms.TargetPrivilegeRepositoryPropertyDescriptor
import org.sonatype.nexus.jsecurity.realms.TargetPrivilegeRepositoryTargetPropertyDescriptor
import org.sonatype.nexus.proxy.NoSuchRepositoryException
import org.sonatype.nexus.proxy.registry.RepositoryRegistry
import org.sonatype.nexus.proxy.repository.GroupRepository
import org.sonatype.nexus.proxy.repository.Repository
import org.sonatype.nexus.proxy.targets.TargetRegistry
import org.sonatype.security.SecuritySystem
import org.sonatype.security.authorization.Privilege
import org.sonatype.security.realms.privileges.PrivilegeDescriptor
import org.sonatype.security.realms.privileges.application.ApplicationPrivilegeMethodPropertyDescriptor
import org.sonatype.security.usermanagement.xml.SecurityXmlUserManager

import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

/**
 * Privilege {@link DirectComponent}.
 *
 * @since 2.8
 */
@Named
@Singleton
@DirectAction(action = 'coreui_Privilege')
class PrivilegeComponent
extends DirectComponentSupport
{

  public static final String DEFAULT_SOURCE = SecurityXmlUserManager.SOURCE

  @Inject
  SecuritySystem securitySystem

  @Inject
  RepositoryRegistry repositoryRegistry

  @Inject
  TargetRegistry targetRegistry

  @Inject
  List<PrivilegeDescriptor> privilegeDescriptors

  @DirectMethod
  @RequiresPermissions('security:privileges:read')
  List<PrivilegeXO> read() {
    return securitySystem.listPrivileges().collect { input ->
      return asPrivilegeXO(input)
    }
  }

  @DirectMethod
  @RequiresAuthentication
  @RequiresPermissions('security:roles:create')
  List<PrivilegeXO> createForRepositoryTarget(final PrivilegeRepositoryTargetXO privilegeXO) {
    def repositoryId = '', groupId = ''
    if (privilegeXO.repositoryId) {
      Repository repository = repositoryRegistry.getRepository(privilegeXO.repositoryId)
      if (repository.getRepositoryKind().isFacetAvailable(GroupRepository.class)) {
        groupId = privilegeXO.repositoryId
      }
      else {
        repositoryId = privilegeXO.repositoryId
      }
    }
    def manager = securitySystem.getAuthorizationManager(DEFAULT_SOURCE)
    List<PrivilegeXO> created = []
    ['create', 'read', 'update', 'delete'].each { method ->
      created << manager.addPrivilege(
          new Privilege(
              id: Long.toHexString(System.nanoTime()),
              name: privilegeXO.name ? "${privilegeXO.name} - (${method})" : null,
              description: privilegeXO.description,
              type: TargetPrivilegeDescriptor.TYPE,
              readOnly: false,
              properties: [
                  (ApplicationPrivilegeMethodPropertyDescriptor.ID): method,
                  (TargetPrivilegeRepositoryTargetPropertyDescriptor.ID): privilegeXO.repositoryTargetId,
                  (TargetPrivilegeRepositoryPropertyDescriptor.ID): repositoryId,
                  (TargetPrivilegeGroupPropertyDescriptor.ID): groupId
              ]
          )
      )
    }
    return created
  }

  @DirectMethod
  @RequiresAuthentication
  @RequiresPermissions('security:privileges:delete')
  void delete(final String id) {
    securitySystem.getAuthorizationManager(DEFAULT_SOURCE).deletePrivilege(id)
  }

  def PrivilegeXO asPrivilegeXO(Privilege input) {
    def privilege = new PrivilegeXO(
        id: input.id,
        name: input.name,
        description: input.description,
        type: input.type,
        typeName: privilegeDescriptors.findResult { PrivilegeDescriptor descriptor ->
          return descriptor.type == input.type ? descriptor : null
        }?.name,
        readOnly: input.readOnly,
        method: input.getPrivilegeProperty('method')
    )
    input.properties.each { key, value ->
      if (key == 'repositoryTargetId') {
        privilege.repositoryTargetId = value
        privilege.repositoryTargetName = targetRegistry.getRepositoryTarget(value)?.name
      }
      else if (key == 'repositoryId' || key == 'repositoryGroupId') {
        privilege.repositoryId = value
        if (value && value != '*' && !value.allWhitespace) {
          try {
            privilege.repositoryName = repositoryRegistry.getRepository(value).name
          }
          catch (NoSuchRepositoryException e) {
            privilege.repositoryName = value
          }
        }
        else {
          privilege.repositoryName = 'All repositories'
        }
      }
    }
    return privilege
  }

}
